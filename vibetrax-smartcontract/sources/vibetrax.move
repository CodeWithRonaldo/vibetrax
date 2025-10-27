#[allow(unused_variable, unused_const, unused_use, duplicate_alias)]
module vibetrax::vibetrax {
    // ============================================================================
    // IMPORTS
    // ============================================================================
    use iota::iota::IOTA;
    use iota::coin::{Self, Coin};
    use iota::balance::{Self, Balance};
    use iota::tx_context::{Self, TxContext};
    use iota::event;
    use iota::object::{Self, UID, ID};
    use iota::table::{Self, Table};
    use iota::transfer;
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // ============================================================================
    // ERROR CONSTANTS
    // ============================================================================
    // Governance errors
    const EINSUFFICIENT_FUNDS: u64 = 10;
    const ENOT_SUBSCRIBED: u64 = 11;
    const ENOT_ENOUGH_TOKENS: u64 = 12;
    const EINVALID_VOTE: u64 = 13;

    // Music NFT errors
    const EINVALID_PURCHASE: u64 = 1;
    const EINVALID_PRICE: u64 = 2;
    const EINVALID_ROYALTY: u64 = 3;
    const ENOT_ARTIST: u64 = 4;
    const ENOT_OWNER: u64 = 5;
    const EINVALID_TRANSFER: u64 = 6;
    const EINSUFFICIENT_AMOUNT: u64 = 7;
    const EINVALID_METADATA: u64 = 8;
    const EINVALID_STREAMING: u64 = 9;

    // Integration errors
    const EINVALID_LIMIT: u64 = 101;

    // ============================================================================
    // STRUCT DEFINITIONS - GOVERNANCE
    // ============================================================================

    // Governance Token
    public struct VibetraxToken has store, key {
        id: UID,
        total_supply: u64,
        balances: Table<address, u64>,
    }

    // Subscription Model
    public struct Subscription has key, store {
        id: UID,
        subscribers: Table<address, u64>, // Stores expiration timestamps
        price_per_month: u64,
    }

    // Governance Proposal
    public struct Proposal has key, store {
        id: UID,
        description: String,
        votes_for: u64,
        votes_against: u64,
        status: bool, // true if approved
    }

    // Treasury Implementation
    public struct Treasury has key {
        id: UID,
        funds: Balance<IOTA>,
    }

    // ============================================================================
    // STRUCT DEFINITIONS - MUSIC NFT
    // ============================================================================

    public struct MusicNFT has key, store {
        id: UID,
        artist: address,
        current_owner: address,
        title: String,
        description: String,
        genre: String,
        music_art: String,
        high_quality_ipfs: String,
        low_quality_ipfs: String,
        price: u64,
        royalty_percentage: u64,
        streaming_count: u64,
        collaborators: vector<address>,
        collaborator_roles: vector<String>,
        collaborator_splits: vector<u64>,
        for_sale: bool,
        escrow: Balance<IOTA>,
        creation_time: u64,
        vote_count: u64
    }

    // Registry to keep track of all NFTs
    public struct NFTRegistry has key {
        id: UID,
        all_nfts: vector<ID>,
        nfts_by_artist: Table<address, vector<ID>>,
        nfts_by_genre: Table<String, vector<ID>>,
    }

    // ============================================================================
    // EVENTS - GOVERNANCE
    // ============================================================================

    public struct TokensMinted has copy, drop {
        recipient: address,
        amount: u64,
    }

    public struct SubscriptionPurchased has copy, drop {
        user: address,
        expires_at: u64,
    }

    public struct ProposalCreated has copy, drop {
        proposal_id: ID,
        description: String,
    }

    public struct ProposalVoted has copy, drop {
        proposal_id: ID,
        voter: address,
        voted_for: bool,
    }

    // ============================================================================
    // EVENTS - MUSIC NFT
    // ============================================================================

    public struct MusicNFTMinted has copy, drop {
        nft_id: ID,
        artist: address,
        title: String,
        price: u64
    }

    public struct MusicNFTPurchased has copy, drop {
        nft_id: ID,
        buyer: address,
        amount: u64
    }

    public struct RoyaltyPaid has copy, drop {
        recipient: address,
        amount: u64
    }

    public struct StreamingRecorded has copy, drop {
        nft_id: ID,
        listener: address
    }

    public struct NFTVoted has copy, drop {
        nft_id: ID,
        voter: address,
        amount: u64,
        new_price: u64
    }

    public struct MusicNFTDeleted has copy, drop {
        nft_id: ID,
        artist: address,
        title: String
    }

    // ============================================================================
    // EVENTS - INTEGRATION
    // ============================================================================

    public struct IntegratedPurchase has copy, drop {
        nft_id: ID,
        buyer: address,
        amount_paid: u64,
        tokens_rewarded: u64
    }

    public struct IntegratedStreaming has copy, drop {
        nft_id: ID,
        streamer: address,
        tokens_rewarded: u64
    }

    // ============================================================================
    // MODULE INITIALIZER
    // ============================================================================

    fun init(ctx: &mut TxContext) {
        // Initialize VibetraxToke
        let token = VibetraxToken {
            id: object::new(ctx),
            total_supply: 0,
            balances: table::new(ctx),
        };
        
        // Initialize Subscription
        let subscription = Subscription {
            id: object::new(ctx),
            subscribers: table::new(ctx),
            price_per_month: 10_000_000, // 0.01 IOTA (assuming smallest unit)
        };
        
        // Initialize Treasury
        let treasury = Treasury {
            id: object::new(ctx),
            funds: balance::zero(),
        };
        
        // Initialize NFT Registry
        let registry = NFTRegistry {
            id: object::new(ctx),
            all_nfts: vector::empty(),
            nfts_by_artist: table::new(ctx),
            nfts_by_genre: table::new(ctx),
        };
        
        // Share the objects
        transfer::share_object(token);
        transfer::share_object(subscription);
        transfer::share_object(treasury);
        transfer::share_object(registry);
    }

    // ============================================================================
    // GOVERNANCE FUNCTIONS
    // ============================================================================

    // Governance Token Minting
    public entry fun mint_tokens(
        token: &mut VibetraxToken,
        recipient: address,
        amount: u64,
        _ctx: &mut TxContext
    ) {
        assert!(amount > 0, EINSUFFICIENT_FUNDS);
        if (!table::contains(&token.balances, recipient)) {
            table::add(&mut token.balances, recipient, 0);
        };
        let balance = table::borrow_mut(&mut token.balances, recipient);
        *balance = *balance + amount;
        token.total_supply = token.total_supply + amount;
        
        event::emit(TokensMinted { recipient, amount });
    }

    // Vote on Proposal
    public entry fun vote_on_proposal(
        proposal: &mut Proposal,
        token: &mut VibetraxToken,
        voter: address,
        amount: u64,
        vote_for: bool
    ) {
        assert!(amount > 0, EINVALID_VOTE);
        if (!table::contains(&token.balances, voter)) {
            table::add(&mut token.balances, voter, 0);
        };
        let balance = table::borrow_mut(&mut token.balances, voter);
        assert!(*balance >= amount, ENOT_ENOUGH_TOKENS);
        
        *balance = *balance - amount;
        if (vote_for) {
            proposal.votes_for = proposal.votes_for + amount;
        } else {
            proposal.votes_against = proposal.votes_against + amount;
        };
        
        event::emit(ProposalVoted { proposal_id: object::uid_to_inner(&proposal.id), voter, voted_for: vote_for });
    }

    // Create a Proposal
    public entry fun create_proposal(
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let proposal = Proposal {
            id: object::new(ctx),
            description: string::utf8(description),
            votes_for: 0,
            votes_against: 0,
            status: false,
        };
        
        event::emit(ProposalCreated { 
            proposal_id: object::uid_to_inner(&proposal.id), 
            description: string::utf8(description) 
        });
        
        transfer::share_object(proposal);
    }

    // Subscribe
    public entry fun subscribe(
        sub: &mut Subscription,
        treasury: &mut Treasury,
        user: address,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let now = tx_context::epoch(ctx);
        let expiry = now + 30; // 30-day subscription
        
        let payment_value = coin::value(&payment);
        assert!(payment_value >= sub.price_per_month, EINSUFFICIENT_FUNDS);
        
        // Add payment to treasury
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut treasury.funds, payment_balance);
        
        if (!table::contains(&sub.subscribers, user)) {
            table::add(&mut sub.subscribers, user, expiry);
        } else {
            let expiration = table::borrow_mut(&mut sub.subscribers, user);
            *expiration = expiry;
        };
        
        event::emit(SubscriptionPurchased { user, expires_at: expiry });
    }

    // Check Subscription Status
    public fun is_subscribed(sub: &Subscription, user: address, ctx: &TxContext): bool {
        if (!table::contains(&sub.subscribers, user)) {
            return false
        };
        let now: u64 = tx_context::epoch(ctx);
        let expiration: u64 = *table::borrow(&sub.subscribers, user);
        expiration > now
    }

    // Distribute Tokens for Activity
    public entry fun distribute_tokens_for_activity(
        token: &mut VibetraxToken,
        user: address,
        activity_type: u8, // 1 = streaming, 2 = purchase
        _ctx: &mut TxContext
    ) {
        let tokens_to_mint = if (activity_type == 1) {
            1 // Streaming reward
        } else if (activity_type == 2) {
            5 // Purchase reward
        } else {
            1 // Default reward
        };
        
        if (!table::contains(&token.balances, user)) {
            table::add(&mut token.balances, user, 0);
        };
        
        let balance = table::borrow_mut(&mut token.balances, user);
        *balance = *balance + tokens_to_mint;
        token.total_supply = token.total_supply + tokens_to_mint;
        
        event::emit(TokensMinted { recipient: user, amount: tokens_to_mint });
    }

    // Treasury withdrawal function
    public entry fun withdraw_from_treasury(
        treasury: &mut Treasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == @0x123, 1000); // Replace with actual admin address
        assert!(balance::value(&treasury.funds) >= amount, EINSUFFICIENT_FUNDS);
        
        let withdrawal = coin::from_balance(balance::split(&mut treasury.funds, amount), ctx);
        transfer::public_transfer(withdrawal, recipient);
    }

    // Get governance statistics
    public fun get_governance_stats(
        token: &VibetraxToken,
        proposals: &vector<Proposal>
    ): (u64, u64, u64) {
        let total_supply = token.total_supply;
        let active_proposals = vector::length(proposals);
        let mut passed_proposals = 0;
        
        let mut i = 0;
        while (i < active_proposals) {
            let proposal = vector::borrow(proposals, i);
            if (proposal.status) {
                passed_proposals = passed_proposals + 1;
            };
            i = i + 1;
        };
        
        (total_supply, active_proposals, passed_proposals)
    }

    // Get token balance for an address
    public fun get_token_balance(token: &VibetraxToken, user: address): u64 {
        if (!table::contains(&token.balances, user)) {
            return 0
        };
        *table::borrow(&token.balances, user)
    }

    // Get treasury balance
    public fun get_treasury_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.funds)
    }

    // Get proposal details
    public fun get_proposal_details(proposal: &Proposal): (String, u64, u64, bool) {
        (proposal.description, proposal.votes_for, proposal.votes_against, proposal.status)
    }

    // ============================================================================
    // MUSIC NFT FUNCTIONS - ACCESSORS
    // ============================================================================

    public fun get_title(nft: &MusicNFT): String {
        nft.title
    }

    public fun get_artist(nft: &MusicNFT): address {
        nft.artist
    }

    public fun get_price(nft: &MusicNFT): u64 {
        nft.price
    }

    public fun get_streaming_count(nft: &MusicNFT): u64 {
        nft.streaming_count
    }

    public fun get_low_quality_link(nft: &MusicNFT): String {
        nft.low_quality_ipfs
    }

    public fun get_high_quality_link(nft: &MusicNFT, ctx: &TxContext): Option<String> {
        if (nft.current_owner == tx_context::sender(ctx)) {
            option::some(nft.high_quality_ipfs)
        } else {
            option::none()
        }
    }

    public fun get_nft_id(nft: &MusicNFT): ID {
        object::uid_to_inner(&nft.id)
    }

    public fun get_nft_genre(nft: &MusicNFT): String {
        nft.genre
    }

    public fun get_current_owner(nft: &MusicNFT): address {
        nft.current_owner
    }

    public fun get_high_quality_link_for_subscribers(nft: &MusicNFT): Option<String> {
        option::some(nft.high_quality_ipfs)
    }

    // ============================================================================
    // MUSIC NFT FUNCTIONS - REGISTRY ACCESSORS
    // ============================================================================

    public fun get_all_nfts(registry: &NFTRegistry): vector<ID> {
        registry.all_nfts
    }

    public fun get_nfts_by_artist(registry: &NFTRegistry, artist: address): vector<ID> {
        if (table::contains(&registry.nfts_by_artist, artist)) {
            *table::borrow(&registry.nfts_by_artist, artist)
        } else {
            vector::empty<ID>()
        }
    }

    public fun get_nfts_by_genre(registry: &NFTRegistry, genre: String): vector<ID> {
        if (table::contains(&registry.nfts_by_genre, genre)) {
            *table::borrow(&registry.nfts_by_genre, genre)
        } else {
            vector::empty<ID>()
        }
    }

    // ============================================================================
    // MUSIC NFT FUNCTIONS - ENTRY FUNCTIONS
    // ============================================================================

    public entry fun mint_music_nft(
        registry: &mut NFTRegistry,
        title: vector<u8>,
        description: vector<u8>,
        genre: vector<u8>,
        music_art: vector<u8>,
        high_quality_ipfs: vector<u8>,
        low_quality_ipfs: vector<u8>,
        price: u64,
        royalty_percentage: u64,
        collaborators: vector<address>,
        collaborator_roles: vector<vector<u8>>,
        collaborator_splits: vector<u64>,
        ctx: &mut TxContext
    ) {
        assert!(royalty_percentage <= 5000, EINVALID_ROYALTY);
        assert!(price > 0, EINVALID_PRICE);
        assert!(vector::length(&high_quality_ipfs) > 0 && vector::length(&low_quality_ipfs) > 0, EINVALID_METADATA);
        
        if (vector::length(&collaborators) > 0) {
            assert!(
                vector::length(&collaborators) == vector::length(&collaborator_roles) &&
                vector::length(&collaborators) == vector::length(&collaborator_splits),
                EINVALID_METADATA
            );
            
            let mut total_split = 0u64;
            let mut i = 0;
            while (i < vector::length(&collaborator_splits)) {
                total_split = total_split + *vector::borrow(&collaborator_splits, i);
                i = i + 1;
            };
            assert!(total_split == 10000, EINVALID_ROYALTY);
        };

        let mut roles_string = vector::empty<String>();
        let mut i = 0;
        while (i < vector::length(&collaborator_roles)) {
            let role = vector::borrow(&collaborator_roles, i);
            vector::push_back(&mut roles_string, string::utf8(*role));
            i = i + 1;
        };

        let nft_id = object::new(ctx);
        let nft_object_id = object::uid_to_inner(&nft_id);
        let sender = tx_context::sender(ctx);
        let genre_string = string::utf8(genre);

        let nft = MusicNFT {
            id: nft_id,
            artist: sender,
            current_owner: sender,
            title: string::utf8(title),
            description: string::utf8(description),
            genre: genre_string,
            music_art: string::utf8(music_art),
            high_quality_ipfs: string::utf8(high_quality_ipfs),
            low_quality_ipfs: string::utf8(low_quality_ipfs),
            price: price,
            royalty_percentage: royalty_percentage,
            streaming_count: 0,
            collaborators: collaborators,
            collaborator_roles: roles_string,
            collaborator_splits: collaborator_splits,
            for_sale: true,
            escrow: balance::zero(),
            creation_time: tx_context::epoch(ctx),
            vote_count: 0
        };

        vector::push_back(&mut registry.all_nfts, nft_object_id);
        
        if (!table::contains(&registry.nfts_by_artist, sender)) {
            table::add(&mut registry.nfts_by_artist, sender, vector::empty<ID>());
        };
        let artist_nfts = table::borrow_mut(&mut registry.nfts_by_artist, sender);
        vector::push_back(artist_nfts, nft_object_id);
        
        if (!table::contains(&registry.nfts_by_genre, genre_string)) {
            table::add(&mut registry.nfts_by_genre, genre_string, vector::empty<ID>());
        };
        let genre_nfts = table::borrow_mut(&mut registry.nfts_by_genre, genre_string);
        vector::push_back(genre_nfts, nft_object_id);

        event::emit(MusicNFTMinted {
            nft_id: nft_object_id,
            artist: sender,
            title: string::utf8(title),
            price: price
        });

        transfer::share_object(nft);
    }

    public entry fun purchase_music_nft(
        _registry: &NFTRegistry,
        nft: &mut MusicNFT,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        assert!(nft.for_sale, EINVALID_PURCHASE);
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= nft.price, EINSUFFICIENT_AMOUNT);

        let buyer = tx_context::sender(ctx);
        let seller = nft.current_owner;
        
        let royalty_amount = (payment_amount * nft.royalty_percentage) / 10000;
        let seller_amount = payment_amount - royalty_amount;
        
        let mut payment_balance = coin::into_balance(payment);
        
        if (seller_amount > 0) {
            let seller_payment = coin::from_balance(balance::split(&mut payment_balance, seller_amount), ctx);
            transfer::public_transfer(seller_payment, seller);
        };
        
        if (royalty_amount > 0) {
            if (vector::length(&nft.collaborators) > 0) {
                let mut i = 0;
                while (i < vector::length(&nft.collaborators)) {
                    let collaborator = *vector::borrow(&nft.collaborators, i);
                    let split_percentage = *vector::borrow(&nft.collaborator_splits, i);
                    let collaborator_amount = (royalty_amount * split_percentage) / 10000;
                    
                    if (collaborator_amount > 0) {
                        let collaborator_payment = coin::from_balance(balance::split(&mut payment_balance, collaborator_amount), ctx);
                        transfer::public_transfer(collaborator_payment, collaborator);
                        
                        event::emit(RoyaltyPaid {
                            recipient: collaborator,
                            amount: collaborator_amount
                        });
                    };
                    
                    i = i + 1;
                };
            } else {
                let artist_payment = coin::from_balance(balance::split(&mut payment_balance, royalty_amount), ctx);
                transfer::public_transfer(artist_payment, nft.artist);
                
                event::emit(RoyaltyPaid {
                    recipient: nft.artist,
                    amount: royalty_amount
                });
            };
        };
        
        if (balance::value(&payment_balance) > 0) {
            let remaining_payment = coin::from_balance(payment_balance, ctx);
            transfer::public_transfer(remaining_payment, seller);
        } else {
            balance::destroy_zero(payment_balance);
        };
        
        nft.current_owner = buyer;
        nft.for_sale = false;
        
        event::emit(MusicNFTPurchased {
            nft_id: object::uid_to_inner(&nft.id),
            buyer: buyer,
            amount: payment_amount
        });
    }

    public entry fun vote_for_nft(
        nft: &mut MusicNFT,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let vote_amount = coin::value(&payment);
        assert!(vote_amount > 0, EINSUFFICIENT_AMOUNT);

        let price_increase = 1;
        nft.price = nft.price + price_increase;
        nft.vote_count = nft.vote_count + 1;

        transfer::public_transfer(payment, nft.artist);
        
        event::emit(NFTVoted {
            nft_id: object::uid_to_inner(&nft.id),
            voter: tx_context::sender(ctx),
            amount: vote_amount,
            new_price: nft.price
        });
    }

    public entry fun stream_music(
        nft: &mut MusicNFT,
        ctx: &mut TxContext
    ) {
        let streamer = tx_context::sender(ctx);
        
        nft.streaming_count = nft.streaming_count + 1;
        
        event::emit(StreamingRecorded {
            nft_id: object::uid_to_inner(&nft.id),
            listener: streamer
        });
    }

    public entry fun update_price(
        nft: &mut MusicNFT,
        new_price: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.current_owner, ENOT_OWNER);
        assert!(new_price > 0, EINVALID_PRICE);
        
        nft.price = new_price;
    }

    public entry fun toggle_for_sale(
        nft: &mut MusicNFT,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.current_owner, ENOT_OWNER);
        nft.for_sale = !nft.for_sale;
    }

    public entry fun update_metadata(
        nft: &mut MusicNFT,
        new_title: vector<u8>,
        new_description: vector<u8>,
        new_genre: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.artist, ENOT_ARTIST);
        
        if (vector::length(&new_title) > 0) {
            nft.title = string::utf8(new_title);
        };
        
        if (vector::length(&new_description) > 0) {
            nft.description = string::utf8(new_description);
        };
        
        if (vector::length(&new_genre) > 0) {
            nft.genre = string::utf8(new_genre);
        };
    }

    public entry fun update_music_files(
        nft: &mut MusicNFT,
        new_music_art: vector<u8>,
        new_high_quality_ipfs: vector<u8>,
        new_low_quality_ipfs: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.artist, ENOT_ARTIST);
        
        if (vector::length(&new_music_art) > 0) {
            nft.music_art = string::utf8(new_music_art);
        };
        
        if (vector::length(&new_high_quality_ipfs) > 0) {
            nft.high_quality_ipfs = string::utf8(new_high_quality_ipfs);
        };
        
        if (vector::length(&new_low_quality_ipfs) > 0) {
            nft.low_quality_ipfs = string::utf8(new_low_quality_ipfs);
        };
    }

    public entry fun update_music_details(
        nft: &mut MusicNFT,
        new_title: vector<u8>,
        new_description: vector<u8>,
        new_genre: vector<u8>,
        new_music_art: vector<u8>,
        new_high_quality_ipfs: vector<u8>,
        new_low_quality_ipfs: vector<u8>,
        new_price: u64,
        new_for_sale: bool,
        new_collaborators: vector<address>,
        new_collaborator_roles: vector<vector<u8>>,
        new_collaborator_splits: vector<u64>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == nft.artist, ENOT_ARTIST);
        
        if (vector::length(&new_collaborators) > 0) {
            assert!(
                vector::length(&new_collaborators) == vector::length(&new_collaborator_roles) &&
                vector::length(&new_collaborators) == vector::length(&new_collaborator_splits),
                EINVALID_METADATA
            );
            
            let mut total_split = 0u64;
            let mut i = 0;
            while (i < vector::length(&new_collaborator_splits)) {
                total_split = total_split + *vector::borrow(&new_collaborator_splits, i);
                i = i + 1;
            };
            assert!(total_split == 10000, EINVALID_ROYALTY);
        };

        if (vector::length(&new_collaborator_roles) > 0) {
            let mut roles_string = vector::empty<String>();
            let mut i = 0;
            while (i < vector::length(&new_collaborator_roles)) {
                let role = vector::borrow(&new_collaborator_roles, i);
                vector::push_back(&mut roles_string, string::utf8(*role));
                i = i + 1;
            };
            nft.collaborator_roles = roles_string;
        };
        
        if (vector::length(&new_collaborators) > 0) {
            nft.collaborators = new_collaborators;
            nft.collaborator_splits = new_collaborator_splits;
        };

        if (vector::length(&new_title) > 0) {
            nft.title = string::utf8(new_title);
        };
        
        if (vector::length(&new_description) > 0) {
            nft.description = string::utf8(new_description);
        };
        
        if (vector::length(&new_genre) > 0) {
            nft.genre = string::utf8(new_genre);
        };
        
        if (vector::length(&new_music_art) > 0) {
            nft.music_art = string::utf8(new_music_art);
        };
        
        if (vector::length(&new_high_quality_ipfs) > 0) {
            nft.high_quality_ipfs = string::utf8(new_high_quality_ipfs);
        };
        
        if (vector::length(&new_low_quality_ipfs) > 0) {
            nft.low_quality_ipfs = string::utf8(new_low_quality_ipfs);
        };
        
        if (sender == nft.current_owner) {
            if (new_price > 0) {
                nft.price = new_price;
            };
            
            nft.for_sale = new_for_sale;
        };
    }

    public entry fun delete_music_nft(
        registry: &mut NFTRegistry,
        nft: MusicNFT,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == nft.artist, ENOT_ARTIST);
        assert!(nft.current_owner == nft.artist, ENOT_OWNER);
        
        let nft_id = object::uid_to_inner(&nft.id);
        let nft_artist = nft.artist;
        let nft_title = nft.title;
        let nft_genre = nft.genre;
        
        let mut i = 0;
        let mut found_index = option::none();
        while (i < vector::length(&registry.all_nfts)) {
            if (*vector::borrow(&registry.all_nfts, i) == nft_id) {
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        if (option::is_some(&found_index)) {
            vector::remove(&mut registry.all_nfts, option::extract(&mut found_index));
        };
        
        if (table::contains(&registry.nfts_by_artist, nft_artist)) {
            let artist_nfts = table::borrow_mut(&mut registry.nfts_by_artist, nft_artist);
            let mut i = 0;
            let mut found_index = option::none();
            while (i < vector::length(artist_nfts)) {
                if (*vector::borrow(artist_nfts, i) == nft_id) {
                    found_index = option::some(i);
                    break
                };
                i = i + 1;
            };
            
            if (option::is_some(&found_index)) {
                vector::remove(artist_nfts, option::extract(&mut found_index));
            };
        };
        
        if (table::contains(&registry.nfts_by_genre, nft_genre)) {
            let genre_nfts = table::borrow_mut(&mut registry.nfts_by_genre, nft_genre);
            let mut i = 0;
            let mut found_index = option::none();
            while (i < vector::length(genre_nfts)) {
                if (*vector::borrow(genre_nfts, i) == nft_id) {
                    found_index = option::some(i);
                    break
                };
                i = i + 1;
            };
            
            if (option::is_some(&found_index)) {
                vector::remove(genre_nfts, option::extract(&mut found_index));
            };
        };
        
        event::emit(MusicNFTDeleted {
            nft_id: nft_id,
            artist: nft_artist,
            title: nft_title
        });
        
        let MusicNFT {
            id,
            artist: _,
            current_owner: _,
            title: _,
            description: _,
            genre: _,
            music_art: _,
            high_quality_ipfs: _,
            low_quality_ipfs: _,
            price: _,
            royalty_percentage: _,
            streaming_count: _,
            collaborators: _,
            collaborator_roles: _,
            collaborator_splits: _,
            for_sale: _,
            escrow,
            creation_time: _,
            vote_count: _
        } = nft;
        
        if (balance::value(&escrow) > 0) {
            let remaining_payment = coin::from_balance(escrow, ctx);
            transfer::public_transfer(remaining_payment, sender);
        } else {
            balance::destroy_zero(escrow);
        };
        
        object::delete(id);
    }

    // ============================================================================
    // MUSIC NFT FUNCTIONS - LISTING & STATS
    // ============================================================================

    public fun get_nfts_for_sale(
        _registry: &NFTRegistry,
        nfts: &vector<MusicNFT>
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let mut i = 0;
        
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            if (nft.for_sale) {
                vector::push_back(&mut result, object::uid_to_inner(&nft.id));
            };
            i = i + 1;
        };
        
        result
    }

    public fun get_most_streamed(
        _registry: &NFTRegistry,
        nfts: &vector<MusicNFT>,
        limit: u64
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let mut streaming_counts = vector::empty<u64>();
        
        let mut i = 0;
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            let nft_id = object::uid_to_inner(&nft.id);
            let count = nft.streaming_count;
            
            let mut j = 0;
            let mut inserted = false;
            
            while (j < vector::length(&result) && !inserted) {
                if (count > *vector::borrow(&streaming_counts, j)) {
                    vector::insert(&mut result, nft_id, j);
                    vector::insert(&mut streaming_counts, count, j);
                    inserted = true;
                };
                j = j + 1;
            };
            
            if (!inserted) {
                vector::push_back(&mut result, nft_id);
                vector::push_back(&mut streaming_counts, count);
            };
            
            i = i + 1;
        };
        
        if (limit > 0 && vector::length(&result) > limit) {
            let mut trimmed = vector::empty<ID>();
            let mut i = 0;
            while (i < limit) {
                vector::push_back(&mut trimmed, *vector::borrow(&result, i));
                i = i + 1;
            };
            trimmed
        } else {
            result
        }
    }

    public fun get_newest_nfts(
        _registry: &NFTRegistry,
        nfts: &vector<MusicNFT>,
        limit: u64
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let mut creation_times = vector::empty<u64>();
        
        let mut i = 0;
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            let nft_id = object::uid_to_inner(&nft.id);
            let time = nft.creation_time;
            
            let mut j = 0;
            let mut inserted = false;
            
            while (j < vector::length(&result) && !inserted) {
                if (time > *vector::borrow(&creation_times, j)) {
                    vector::insert(&mut result, nft_id, j);
                    vector::insert(&mut creation_times, time, j);
                    inserted = true;
                };
                j = j + 1;
            };
            
            if (!inserted) {
                vector::push_back(&mut result, nft_id);
                vector::push_back(&mut creation_times, time);
            };
            
            i = i + 1;
        };
        
        if (limit > 0 && vector::length(&result) > limit) {
            let mut trimmed = vector::empty<ID>();
            let mut i = 0;
            while (i < limit) {
                vector::push_back(&mut trimmed, *vector::borrow(&result, i));
                i = i + 1;
            };
            trimmed
        } else {
            result
        }
    }

    public fun get_nft_details(
        nft: &MusicNFT
    ): (address, address, String, u64, u64, bool) {
        (
            nft.artist,
            nft.current_owner,
            nft.title,
            nft.streaming_count,
            nft.price,
            nft.for_sale
        )
    }

    public fun get_artist_stats(
        _registry: &NFTRegistry,
        artist: address,
        nfts: &vector<MusicNFT>
    ): (u64, u64, u64) {
        let mut total_nfts = 0;
        let mut total_streams = 0;
        let mut total_sales = 0;
        
        let mut i = 0;
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            if (nft.artist == artist) {
                total_nfts = total_nfts + 1;
                total_streams = total_streams + nft.streaming_count;
                
                if (nft.current_owner != artist) {
                    total_sales = total_sales + 1;
                };
            };
            i = i + 1;
        };
        
        (total_nfts, total_streams, total_sales)
    }

    public fun get_platform_stats(
        nfts: &vector<MusicNFT>
    ): (u64, u64, u64) {
        let total_nfts = vector::length(nfts);
        let mut total_streams = 0;
        let mut total_sales = 0;
        
        let mut i = 0;
        while (i < total_nfts) {
            let nft = vector::borrow(nfts, i);
            total_streams = total_streams + nft.streaming_count;
            
            if (nft.current_owner != nft.artist) {
                total_sales = total_sales + 1;
            };
            
            i = i + 1;
        };
        
        (total_nfts, total_streams, total_sales)
    }

    // ============================================================================
    // INTEGRATION FUNCTIONS
    // ============================================================================

    public entry fun purchase_and_reward(
        registry: &NFTRegistry,
        nft: &mut MusicNFT,
        token: &mut VibetraxToken,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let payment_amount = coin::value(&payment);
        
        let nft_id = get_nft_id(nft);
        
        purchase_music_nft(registry, nft, payment, ctx);
        
        let tokens_rewarded = 5;
        
        distribute_tokens_for_activity(token, buyer, 2, ctx);
        
        event::emit(IntegratedPurchase {
            nft_id,
            buyer,
            amount_paid: payment_amount,
            tokens_rewarded
        });
    }

    public entry fun stream_and_reward(
        nft: &mut MusicNFT,
        token: &mut VibetraxToken,
        ctx: &mut TxContext
    ) {
        let streamer = tx_context::sender(ctx);
        
        let nft_id = get_nft_id(nft);
        
        stream_music(nft, ctx);
        
        let tokens_rewarded = 1;
        
        distribute_tokens_for_activity(token, streamer, 1, ctx);
        
        event::emit(IntegratedStreaming {
            nft_id,
            streamer,
            tokens_rewarded
        });
    }

    public fun get_high_quality_for_subscribers(
        nft: &MusicNFT,
        sub: &Subscription,
        ctx: &TxContext
    ): Option<String> {
        let user = tx_context::sender(ctx);
        
        if (get_current_owner(nft) == user) {
            return get_high_quality_link(nft, ctx)
        };
        
        if (is_subscribed(sub, user, ctx)) {
            return get_high_quality_link_for_subscribers(nft)
        };
        
        option::none()
    }

    public fun get_artist_dashboard(
        registry: &NFTRegistry,
        token: &VibetraxToken,
        artist: address,
        nfts: &vector<MusicNFT>,
        _ctx: &TxContext
    ): (u64, u64, u64, u64) {
        let (total_nfts, total_streams, total_sales) = 
            get_artist_stats(registry, artist, nfts);
            
        let token_balance = get_token_balance(token, artist);
        
        (total_nfts, total_streams, total_sales, token_balance)
    }

    public fun get_nft_complete_details(
        nft: &MusicNFT,
        token: &VibetraxToken,
        _ctx: &TxContext
    ): (ID, address, address, String, String, String, u64, u64, bool, u64) {
        let nft_id = get_nft_id(nft);
        let artist = get_artist(nft);
        let current_owner = get_current_owner(nft);
        let title = get_title(nft);
        let price = get_price(nft);
        let streaming_count = get_streaming_count(nft);
        
        let (_, _, description, _, _, for_sale) = get_nft_details(nft);
        
        let genre = get_nft_genre(nft);
        
        let artist_tokens = get_token_balance(token, artist);
        
        (nft_id, artist, current_owner, title, description, genre, price, streaming_count, for_sale, artist_tokens)
    }

    public fun get_marketplace_home_data(
        registry: &NFTRegistry,
        nfts: &vector<MusicNFT>,
        limit: u64
    ): (vector<ID>, vector<ID>, vector<ID>) {
        assert!(limit > 0, EINVALID_LIMIT);
        
        let trending = get_most_streamed(registry, nfts, limit);
        
        let newest = get_newest_nfts(registry, nfts, limit);
        
        let mut for_sale = get_nfts_for_sale(registry, nfts);
        
        if (limit > 0 && vector::length(&for_sale) > limit) {
            let mut trimmed = vector::empty<ID>();
            let mut i = 0;
            while (i < limit) {
                vector::push_back(&mut trimmed, *vector::borrow(&for_sale, i));
                i = i + 1;
            };
            for_sale = trimmed;
        };
        
        (trending, newest, for_sale)
    }

    public fun get_user_profile(
        _registry: &NFTRegistry,
        token: &VibetraxToken,
        sub: &Subscription,
        user: address,
        nfts: &vector<MusicNFT>,
        ctx: &TxContext
    ): (u64, bool, u64) {
        let token_balance = get_token_balance(token, user);
        
        let is_subbed = is_subscribed(sub, user, ctx);
        
        let mut owned_count = 0;
        let mut i = 0;
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            if (get_current_owner(nft) == user) {
                owned_count = owned_count + 1;
            };
            i = i + 1;
        };
        
        (owned_count, is_subbed, token_balance)
    }

    public fun get_platform_dashboard(
        nfts: &vector<MusicNFT>,
        treasury: &Treasury,
        token: &VibetraxToken,
        proposals: &vector<Proposal>
    ): (u64, u64, u64, u64, u64, u64, u64) {
        let (total_nfts, total_streams, total_sales) = get_platform_stats(nfts);
        
        let treasury_balance = get_treasury_balance(treasury);
        
        let (total_tokens, active_proposals, passed_proposals) = 
            get_governance_stats(token, proposals);
        
        (total_nfts, total_streams, total_sales, treasury_balance, total_tokens, active_proposals, passed_proposals)
    }

    public fun get_user_owned_nfts(
        user: address,
        nfts: &vector<MusicNFT>
    ): vector<ID> {
        let mut owned_nfts = vector::empty<ID>();
        
        let mut i = 0;
        while (i < vector::length(nfts)) {
            let nft = vector::borrow(nfts, i);
            if (get_current_owner(nft) == user) {
                vector::push_back(&mut owned_nfts, get_nft_id(nft));
            };
            i = i + 1;
        };
        
        owned_nfts
    }

    public fun get_user_created_nfts(
        registry: &NFTRegistry,
        user: address
    ): vector<ID> {
        get_nfts_by_artist(registry, user)
    }

    public fun get_nfts_by_genre_limited(
        registry: &NFTRegistry,
        genre: String,
        limit: u64
    ): vector<ID> {
        let genre_nfts = get_nfts_by_genre(registry, genre);
        
        if (limit > 0 && vector::length(&genre_nfts) > limit) {
            let mut trimmed = vector::empty<ID>();
            let mut i = 0;
            while (i < limit) {
                vector::push_back(&mut trimmed, *vector::borrow(&genre_nfts, i));
                i = i + 1;
            };
            return trimmed
        };
        
        genre_nfts
    }

    public fun can_access_high_quality(
        nft: &MusicNFT,
        sub: &Subscription,
        user: address,
        ctx: &TxContext
    ): bool {
        if (get_current_owner(nft) == user) {
            return true
        };
        
        if (is_subscribed(sub, user, ctx)) {
            return true
        };
        
        false
    }
}
