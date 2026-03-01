/*
    ====== VIBETRAX =====
    VibeTrax is a decentralized music platform built on the 'Iota blockchain',
    1. Enabling upcoming artists to release music 'without upfront capital', 
    2. Collaborate transparently, and earn fair, on-chain revenue. 
    3. Fans can stream, own, and even resell music—creating an ecosystem where everyone is rewarded based on the value they contribute.

    Scenario
    1. Initial upload: Artist set collaborators and their split percentages (e.g {producer: 20%, writer: 20%, marketer: 20%}), The remaining 40% is the artist percentage.
    2. On Resale: Same splitting ({producer: 20%, writer: 20%, marketer: 20%, Artist: 40%}) of the royalty set [say 20%]

    If Royalty = 20%
    If Initial song value = $10

    Initial sale: [{producer: $2, writer: $2, marketer: $2, artist: $4}]

    After song value increases [e.g to $100]
    New Song value = $100

    Royalty value = (20% of $100) = $20
    Resale with collaborator royalty: [{producer: $4, writer: $4, marketer: $4, artist: $8, currentOwner: $80}]
    Resale without collaborator royalty: [{artist: $20, currentOwner: $80}]

    song value increases based on user interactions (Streams and likes)
    Every stream or every like can increase the value of the song by minute quantity (e.g 0.00001)
    And we decide the calculation (Say 20 streams + 50 Likes will cause that increment). And we can make them increase the value independently

    FEATURES:
    1.(DONE) Upload Music (title, description, genre, image, previewAudio, fullAudio, collaborators[{name, role, address, percentage, hasRoyalty}], initialPrice)
    2. (DONE) Purchase Music (Transferring ownership to purchaser, music is considered SOLD, distribution split)
    3. Subscription (30 days subscription with IOTA, that allows unlimited streams of fullAudio of all music, earn platform tokens)
    4. (PARTIALY_DONE) Stream(review for non-premium, fullAudio for premium, one stream per account per music, only subscribed users earn token for streaming, value of music increase)
    5. (DONE) Like (one per account, increases value of music)
    6. Tip (Just platform Tokens sent to artist)
    7. Boost (Artist decide to boost their music with platform tokens. Boost requires you to buy a plan. Every plan has their unique price)
    8. Update [add/remove from market, update music details], Delete
    9. Withdraw (smart contract / Frontend)
    10. (DONE) Platform Fee: 1%
    11. Update platform fee (Admin)

    // Security
    1. (DONE) A collaborator cannot be added twice to a song
    2. (DONE) One Stream per account per music (Frontend will call the stream method after 1 minute of listening)

    // REVENUE
    1. On every claim (balance withdrawal, token withdrawal)
    2. From Subscription

    // Future Plans
    1. Stream-To-Earn (x402) -> Pay as you go. Users pay for streaming themselves (PROPOSED: x402)
    2. Governance ->  Vote on platform decisions (Platform Fee)
*/
module vibetrax::vibetrax {
    use std::ascii::String;
    use iota::clock::Clock;
    use iota::event;
    use iota::coin::Coin;
    use iota::iota::IOTA;
    use iota::table::Table;
    use iota::table;
    use iota::transfer::public_transfer;

    // === Errors ===
    const EINVALID_PURCHASE: u64 = 1;
    const EINVALID_PRICE: u64 = 2;
    const EINVALID_ROYALTY: u64 = 3;
    const ENOT_ARTIST: u64 = 4;
    const ENOT_OWNER: u64 = 5;
    const EINVALID_TRANSFER: u64 = 6;
    const EINSUFFICIENT_AMOUNT: u64 = 7;
    const EINVALID_METADATA: u64 = 8;
    const EINVALID_STREAMING: u64 = 9;
    const EHAS_DUPLICATES: u64 = 10;
    const EADDRESS_MISMATCH: u64 = 11;
    const EALREADY_LIKED: u64 = 12;
    const EALREADY_STREAMED: u64 = 13;

    // === Constants ===
    const BASIS_POINTS: u64 = 10_000; // For percentage calculations
    const NANOS: u64 = 1_000_000_000;
    const LIKE_VALUE_INCREASE: u64 = 2_000_000; // 0.002 IOTA in nanos
    const PLATFORM_FEE: u64 = 100; // 1% fee in basis points

    // === Structs ==
    public struct User has store, copy, drop {
        name: String,
        user_address: address,
        role: Option<String>,
        split: Option<u64>,
        has_royalty: Option<bool>
    }

    public struct Music has key, store {
        id: UID,
        artist: User,
        current_owner: User,
        title: String,
        description: String,
        genre: String,
        music_image: String,
        preview_music: String,
        full_music: String,
        price: u64,
        streaming_count: u64,
        streaming_table: Table<address, bool>, // To track if a user has streamed the music
        likes: u64,
        likes_table: Table<address, bool>, // To track if a user has liked the music
        collaborators: vector<User>,
        for_sale: bool,
        creation_time: u64
    }

    // === Events ===

    public struct MusicUploaded has copy, drop {
        music_id: ID,
        artist: User,
        current_owner: User,
        title: String,
        description: String,
        genre: String,
        music_image: String,
        preview_music: String,
        full_music: String,
        price: u64,
        streaming_count: u64,
        likes: u64,
        collaborators: vector<User>,
        for_sale: bool,
        creation_time: u64
    }

    public struct MusicPurchased has copy, drop {
        music_id: ID,
        buyer: User,
        amount: u64
    }

    public struct MusicLiked has copy, drop {
        music_id: ID,
        liker: User,
        amount: u64,
        new_price: u64
    }

    public struct RoyaltyPaid has copy, drop {
        recipient: User,
        amount: u64
    }

    // === Method Aliases ===

    // === Public-Mutative Functions ===
    public fun upload_music(
        title: String,
        description: String,
        genre: String,
        music_image: String,
        preview_music: String,
        full_music: String,
        price: u64,
        collaborators: vector<User>,
        artist: User,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EINVALID_PRICE);
        assert!(preview_music.length() > 0 && full_music.length() > 0, EINVALID_METADATA);

        // Assert caller is the declared artist instead of silently overwriting
        let sender = tx_context::sender(ctx);
        assert!(artist.user_address == sender, ENOT_ARTIST);

        // Duplicate check: count occurrences of each address; abort if any > 1
        if (collaborators.length() > 0) {
            collaborators.do_ref!(|collaborator| {
                let count = count_address_occurrences(&collaborators, collaborator.user_address);
                assert!(count <= 1, EHAS_DUPLICATES);
            });
        };

        let music_id = object::new(ctx);
        let event_id = music_id.to_inner();
        let creation_time = clock.timestamp_ms();

        // artist has `copy` so it can be used for both fields without a move error
        let nft = Music {
            id: music_id,
            artist: artist,
            current_owner: artist,
            title: title,
            description: description,
            genre: genre,
            music_image: music_image,
            preview_music: preview_music,
            full_music: full_music,
            price: price * NANOS, // Convert to nanos for precision
            streaming_count: 0,
            collaborators: collaborators,
            for_sale: true,
            creation_time: creation_time,
            likes: 0,
            likes_table: table::new(ctx),
            streaming_table: table::new(ctx)
        };

        event::emit(MusicUploaded {
            music_id: event_id,
            artist: artist,
            current_owner: artist,
            title: title,
            description: description,
            genre: genre,
            music_image: music_image,
            preview_music: preview_music,
            full_music: full_music,
            price: price * NANOS, // Convert to nanos for precision
            streaming_count: 0,
            collaborators: collaborators,
            for_sale: true,
            creation_time: creation_time,
            likes: 0
        });

        transfer::share_object(nft);
    }

    public fun purchase_music_nft(
        music: &mut Music,
        mut payment: Coin<IOTA>,
        buyer: User,
        ctx: &mut TxContext
    ) {
        assert!(music.for_sale, EINVALID_PURCHASE);
        let payment_amount = payment.value();
        assert!(payment_amount == music.price, EINSUFFICIENT_AMOUNT);

        let signer_address = tx_context::sender(ctx);
        assert!(buyer.user_address == signer_address, EADDRESS_MISMATCH);
        assert!(buyer.user_address != music.current_owner.user_address, EINVALID_PURCHASE);

        let seller = music.current_owner;
        let initial_sale = music.current_owner.user_address == music.artist.user_address;

        if (initial_sale) {
            if (music.collaborators.length() > 0) {
                let mut i = 0;
                while (i < music.collaborators.length()) {
                    let collaborator = music.collaborators[i];
                    if (collaborator.split.is_some()) {
                        let collaborator_split = *collaborator.split.borrow();
                        let split_value = (payment_amount * (collaborator_split * 100)) / BASIS_POINTS;
                        let collab_coin = payment.split(split_value, ctx);
                        public_transfer(collab_coin, collaborator.user_address);
                    };
                    i = i + 1;
                };

                public_transfer(payment, music.artist.user_address);
            } else {
                // If no collaborators, entire amount goes to artist
                public_transfer(payment, music.artist.user_address);
            }

        } else {
             // Resale: Pay artist and collaborators royalties
            let royalty_amount = (payment_amount * 2000) / BASIS_POINTS; // 20% royalty
            let resale_value = payment_amount - royalty_amount;

            // Pay current owner (seller)
            let resale_coin = payment.split(resale_value, ctx);
            public_transfer(resale_coin, seller.user_address);

            // Pay artist and collaborators from royalty
            if (music.collaborators.length() > 0) {
                let mut i = 0;
                while (i < music.collaborators.length()) {
                    let collaborator = music.collaborators[i];
                    if (collaborator.has_royalty.is_some() && *collaborator.has_royalty.borrow()) {
                        let collaborator_split = *collaborator.split.borrow();
                        let split_value = (royalty_amount * (collaborator_split * 100)) / BASIS_POINTS;
                        let collab_coin = payment.split(split_value, ctx);
                        public_transfer(collab_coin, collaborator.user_address);

                        event::emit(RoyaltyPaid {
                            recipient: collaborator,
                            amount: split_value
                        });
                    };
                    i = i + 1;
                };

                public_transfer(payment, music.artist.user_address);
            } else {
                // If no collaborators, entire royalty goes to artist
                public_transfer(payment, music.artist.user_address);
            }
        };

        // Transfer ownership to buyer
        music.current_owner = buyer;
        music.for_sale = false;

        event::emit(MusicPurchased {
            music_id: music.id.to_inner(),
            buyer: buyer,
            amount: payment_amount
        });
    }

    public fun like_music(music: &mut Music, liker: User, ctx: &mut TxContext) {
        let signer_address = tx_context::sender(ctx);
        assert!(liker.user_address == signer_address, EADDRESS_MISMATCH);
        // Add check to ensure one like per account per music
        assert!(!music.likes_table.contains(liker.user_address), EALREADY_LIKED);
        music.likes = music.likes + 1;
        // Music value increase calculation:
        // 10,000,000,000
        //      2,000,000
        // -----------------
        // 10,002,000,000 
        // -----------------
        // 10,002,000,000 / 1,000,000,000 = 10.002 IOTA

        music.price = music.price + LIKE_VALUE_INCREASE;
        music.likes_table.add(liker.user_address, true);

        event::emit(MusicLiked {
            music_id: music.id.to_inner(),
            liker: liker,
            amount: LIKE_VALUE_INCREASE,
            new_price: music.price
        });

    }

    public fun stream_music(music: &mut Music, liker: User, ctx: &mut TxContext) {
        let signer_address = tx_context::sender(ctx);
        assert!(liker.user_address == signer_address, EADDRESS_MISMATCH);
        // Add check to ensure one stream per account per music
        assert!(!music.streaming_table.contains(liker.user_address), EALREADY_STREAMED);
        music.streaming_count = music.streaming_count + 1;
        // Music value increase calculation:
        // 10,000,000,000
        //      2,000,000
        // -----------------
        // 10,002,000,000 
        // -----------------
        // 10,002,000,000 / 1,000,000,000 = 10.002 IOTA

        music.price = music.price + LIKE_VALUE_INCREASE;
        music.streaming_table.add(liker.user_address, true);
    }


    // === Public-View Functions ===

    // === Admin Functions ===

    // === Public-Package Functions ===

    // === Private Functions ===

    fun count_address_occurrences(collaborators: &vector<User>, target: address): u64 {
        let mut count = 0u64;
        collaborators.do_ref!(|collab| {
            if (collab.user_address == target) {
                count = count + 1;
            }
        });
        count
    }

    // === Test Functions ===
}

// For Move coding conventions, see
// https://docs.iota.org/developer/iota-101/move-overview/conventions