package com.hiresmusic.equalizer

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Real audio equalizer backed by android.media.audiofx on the global output
 * mix (session 0), so it affects the app's playback. Also exposes a bass boost.
 *
 * All @ReactMethod functions return void (Promise-based getters resolve
 * asynchronously) to stay compatible with the New Architecture TurboModule
 * interop. If a device/emulator has no audio-effect HAL, getConfig() falls back
 * to a standard 5-band layout so the UI still renders.
 */
class EqualizerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null
    private var available = false
    // Audio session to attach to. 0 = global output mix (does NOT affect
    // Bluetooth); the player's real ExoPlayer session id is set via setSession()
    // so the EQ also works over Bluetooth/A2DP.
    private var sessionId = 0

    override fun getName() = "EqualizerModule"

    // Attach the effects to the player's audio session id (from track-player).
    @ReactMethod
    fun setSession(newSessionId: Int) {
        if (newSessionId == sessionId && equalizer != null) return
        sessionId = newSessionId
        try {
            equalizer?.release()
        } catch (e: Throwable) {}
        try {
            bassBoost?.release()
        } catch (e: Throwable) {}
        equalizer = null
        bassBoost = null
        ensure()
    }

    private fun ensure() {
        if (equalizer == null) {
            try {
                // Priority 1000, on the player's session (falls back to 0).
                equalizer = Equalizer(1000, sessionId)
                available = true
            } catch (e: Throwable) {
                available = false
            }
        }
        if (bassBoost == null) {
            try {
                bassBoost = BassBoost(1000, sessionId)
            } catch (e: Throwable) {
                // ignore — bass boost optional
            }
        }
    }

    @ReactMethod
    fun getConfig(promise: Promise) {
        ensure()
        val map = Arguments.createMap()
        try {
            val eq = equalizer
            if (available && eq != null) {
                val bands = eq.numberOfBands.toInt()
                val range = eq.bandLevelRange
                map.putBoolean("available", true)
                map.putInt("numberOfBands", bands)
                map.putInt("minLevel", range[0].toInt())
                map.putInt("maxLevel", range[1].toInt())
                val freqs = Arguments.createArray()
                for (i in 0 until bands) freqs.pushInt(eq.getCenterFreq(i.toShort()))
                map.putArray("centerFreqs", freqs)
                val presets = Arguments.createArray()
                for (i in 0 until eq.numberOfPresets.toInt()) {
                    presets.pushString(eq.getPresetName(i.toShort()))
                }
                map.putArray("presets", presets)
                promise.resolve(map)
                return
            }
        } catch (e: Throwable) {
            // fall through to fallback
        }
        // Fallback: standard 5-band layout (levels in millibels, freqs in milliHz)
        map.putBoolean("available", false)
        map.putInt("numberOfBands", 5)
        map.putInt("minLevel", -1500)
        map.putInt("maxLevel", 1500)
        val freqs = Arguments.createArray()
        intArrayOf(60000, 230000, 910000, 3600000, 14000000).forEach { freqs.pushInt(it) }
        map.putArray("centerFreqs", freqs)
        map.putArray("presets", Arguments.createArray())
        promise.resolve(map)
    }

    @ReactMethod
    fun setEnabled(enabled: Boolean) {
        ensure()
        try {
            equalizer?.enabled = enabled
        } catch (e: Throwable) {}
    }

    @ReactMethod
    fun usePreset(index: Int) {
        ensure()
        try {
            equalizer?.usePreset(index.toShort())
        } catch (e: Throwable) {}
    }

    @ReactMethod
    fun setBandLevel(band: Int, level: Int) {
        ensure()
        try {
            equalizer?.setBandLevel(band.toShort(), level.toShort())
        } catch (e: Throwable) {}
    }

    @ReactMethod
    fun setBassBoost(strength: Int) {
        ensure()
        try {
            bassBoost?.let {
                if (it.strengthSupported) {
                    it.enabled = strength > 0
                    it.setStrength(strength.toShort())
                }
            }
        } catch (e: Throwable) {}
    }

    @ReactMethod
    fun getState(promise: Promise) {
        ensure()
        val map = Arguments.createMap()
        try {
            val eq = equalizer
            if (available && eq != null) {
                map.putBoolean("enabled", eq.enabled)
                val levels = Arguments.createArray()
                for (i in 0 until eq.numberOfBands.toInt()) {
                    levels.pushInt(eq.getBandLevel(i.toShort()).toInt())
                }
                map.putArray("bandLevels", levels)
            } else {
                map.putBoolean("enabled", false)
                map.putArray("bandLevels", Arguments.createArray())
            }
        } catch (e: Throwable) {
            map.putBoolean("enabled", false)
            map.putArray("bandLevels", Arguments.createArray())
        }
        promise.resolve(map)
    }

    override fun invalidate() {
        try {
            equalizer?.release()
            bassBoost?.release()
        } catch (e: Throwable) {}
        equalizer = null
        bassBoost = null
        super.invalidate()
    }
}
