/*
    ====== VIBE TOKEN =====

    VIBE is the native platform token of VibeTrax.
    It is earned by users for streaming music (stream-to-earn),
    and spent on:
      - Tipping artists (send VIBE directly to an artist)
      - Boosting music (artist pays VIBE to promote their track)

    HOW IOTA COINS WORK (quick primer):
    ─────────────────────────────────────
    1. You define a "one-time witness" (OTW) struct — a struct with the EXACT
       same name as the module in ALL_CAPS and only the `drop` ability.
       The Move runtime guarantees it can only ever be created ONCE (at init time).

    2. You pass that OTW into `coin::create_currency(...)` inside `init`.
       This registers VIBE as an official coin type and gives you a `TreasuryCap<VIBE_TOKEN>`.

    3. `TreasuryCap<VIBE_TOKEN>` is the "mint key". Whoever holds it can mint new VIBE.
       We wrap it in a shared `VibeTreasury` object so the vibetrax module can call
       our `mint_to` function from `stream_music`.

    4. `CoinMetadata<VIBE_TOKEN>` holds the name, symbol, decimals, icon etc.
       It is frozen (immutable) after creation.

    WHAT NEEDS TO BE WIRED UP IN vibetrax.move:
    ────────────────────────────────────────────
    - `stream_music` should call `vibe_token::mint_to(treasury, amount, recipient, ctx)`
      to reward subscribers with VIBE after a valid stream.
    - `tip_artist` (to be added) should call `coin::transfer<VIBE_TOKEN>(...)` to send
      a user's VIBE balance to the artist address.
    - `boost_music` (to be added) should call `vibe_token::burn(treasury, vibe_coin)`
      to spend VIBE on a boost plan (deflationary).
*/
module vibetrax::vibe_token {
    use iota::coin::{Self, TreasuryCap};

    // ── One-Time Witness ──────────────────────────────────────────────────────
    // MUST be named exactly as the module (VIBE_TOKEN) in ALL_CAPS.
    // MUST have only `drop`.
    // The Move runtime passes one (and only one) instance of this into `init`.
    public struct VIBE_TOKEN has drop {}

    // ── Shared Treasury ───────────────────────────────────────────────────────
    // We wrap the TreasuryCap in a shared object so that other modules
    // (vibetrax.move) can call `mint_to` without owning the cap themselves.
    // If you want admin-only minting instead, make this an owned object by
    // using transfer::transfer to send it to the deployer's address.
    public struct VibeTreasury has key {
        id: UID,
        cap: TreasuryCap<VIBE_TOKEN>
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    // Called ONCE automatically at package publish time.
    // Sets up the VIBE coin type and makes the treasury a shared object.
    fun init(witness: VIBE_TOKEN, ctx: &mut TxContext) {
        // coin::create_currency registers the VIBE coin type on-chain.
        // Parameters:
        //   witness     - the OTW, proves this is the one-time setup call
        //   decimals    - 6 decimal places (1 VIBE = 1_000_000 base units)
        //   symbol      - shown in wallets as "VIBE"
        //   name        - full display name
        //   description - shown in explorers
        //   icon_url    - option::none() for now; update with option::some(url) later
        // Returns:
        //   treasury_cap - the mint/burn key, stored in VibeTreasury
        //   metadata     - coin info object, frozen so it can't be changed
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            6,
            b"VIBE",
            b"Vibe Token",
            b"VibeTrax platform token. Earn by streaming, spend on tips and boosts.",
            option::none(),
            ctx
        );

        // Freeze metadata — standard practice so nobody can alter name/symbol after launch.
        transfer::public_freeze_object(metadata);

        // Share the treasury so vibetrax.move can call mint_to in stream_music.
        transfer::share_object(VibeTreasury {
            id: object::new(ctx),
            cap: treasury_cap
        });
    }

    // ── Mint ──────────────────────────────────────────────────────────────────
    // Mints `amount` VIBE (in base units) and sends it to `recipient`.
    //
    // Called from vibetrax::stream_music to reward a subscriber after streaming.
    // Example call in vibetrax.move:
    //   vibe_token::mint_to(treasury, STREAM_TOKEN_REWARD, subscriber_address, ctx);
    //
    // IMPORTANT — decimal alignment:
    //   STREAM_TOKEN_REWARD is currently 10 in vibetrax.move (plain units).
    //   With 6 decimals, 10 VIBE = 10_000_000 base units.
    //   Update STREAM_TOKEN_REWARD to 10_000_000 in vibetrax.move to match.
    public fun mint_to(
        treasury: &mut VibeTreasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let vibe = coin::mint(&mut treasury.cap, amount, ctx);
        transfer::public_transfer(vibe, recipient);
    }

    // ── Burn ──────────────────────────────────────────────────────────────────
    // Destroys VIBE permanently. Called when a user pays for a boost plan.
    // Burning makes VIBE deflationary — as more people boost, supply shrinks.
    //
    // Called from vibetrax::boost_music (to be implemented):
    //   vibe_token::burn(treasury, vibe_payment);
    public fun burn(
        treasury: &mut VibeTreasury,
        vibe: iota::coin::Coin<VIBE_TOKEN>
    ) {
        coin::burn(&mut treasury.cap, vibe);
    }

    // ── Total Supply View ─────────────────────────────────────────────────────
    // Returns how many VIBE base units have been minted in total.
    // Useful for frontend dashboards and analytics.
    public fun total_supply(treasury: &VibeTreasury): u64 {
        coin::total_supply(&treasury.cap)
    }
}