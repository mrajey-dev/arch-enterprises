<template>
  <div v-if="isDiwaliSeason" class="diwali-decoration-root" aria-hidden="true">
    <!-- ✨ Floating Diyas Row (top) -->
    <div class="diwali-diya-row top">
      <span v-for="n in 14" :key="'td'+n" class="diya" :style="diyaStyle(n, 14)">🪔</span>
    </div>

    <!-- ✨ Floating Diyas Row (bottom) -->
    <div class="diwali-diya-row bottom">
      <span v-for="n in 14" :key="'bd'+n" class="diya" :style="diyaStyle(n, 14)">🪔</span>
    </div>

    <!-- 🎉 Hanging string lights -->
    <div class="diwali-lights-string top-left">
      <span v-for="n in 12" :key="'ll'+n" class="light-bulb" :style="bulbStyle(n)"></span>
    </div>
    <div class="diwali-lights-string top-right">
      <span v-for="n in 12" :key="'rl'+n" class="light-bulb" :style="bulbStyle(n)"></span>
    </div>

    <!-- 🌟 Floating sparkle particles -->
    <div class="diwali-sparkles">
      <span
        v-for="n in 20"
        :key="'sp'+n"
        class="sparkle"
        :style="sparkleStyle(n)"
      >✦</span>
    </div>

    <!-- 🎆 Corner firework animations -->
    <div class="firework-corner top-left-fw">
      <span class="fw-burst">🎆</span>
    </div>
    <div class="firework-corner top-right-fw">
      <span class="fw-burst">🎇</span>
    </div>

    <!-- 🏮 Hanging lanterns left side -->
    <div class="diwali-lanterns left">
      <span class="lantern" style="--delay:0s; --x:-5px">🏮</span>
      <span class="lantern" style="--delay:0.6s; --x:8px">🏮</span>
      <span class="lantern" style="--delay:1.2s; --x:-3px">🏮</span>
    </div>

    <!-- 🏮 Hanging lanterns right side -->
    <div class="diwali-lanterns right">
      <span class="lantern" style="--delay:0.3s; --x:5px">🏮</span>
      <span class="lantern" style="--delay:0.9s; --x:-8px">🏮</span>
      <span class="lantern" style="--delay:1.5s; --x:3px">🏮</span>
    </div>

    <!-- 🎊 Diwali greeting banner -->
    <transition name="banner-slide">
      <div v-if="showBanner" class="diwali-banner" @click="closeBanner">
        <button class="banner-close-btn" @click.stop="closeBanner" aria-label="Close Diwali banner">×</button>
        <div class="banner-inner">
          <span class="banner-emoji">🪔</span>
          <div class="banner-text">
            <div class="banner-title">🌟 Happy Diwali! 🌟</div>
            <div class="banner-subtitle">{{ diwaliGreeting }}</div>
          </div>
          <span class="banner-emoji">🪔</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DiwaliDecoration',

  data() {
    return {
      isDiwaliSeason: false,
      showBanner: false,
      diwaliDate: null,
      checkedAt: null,
    };
  },

  computed: {
    diwaliGreeting() {
      if (!this.diwaliDate) return 'Wishing you joy, prosperity & light!';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dDay = new Date(this.diwaliDate);
      dDay.setHours(0, 0, 0, 0);
      const diff = Math.round((dDay - today) / 86400000);
      if (diff > 0) return `Diwali is in ${diff} day${diff > 1 ? 's' : ''}! ✨`;
      if (diff === 0) return 'Today is Diwali! 🎉 Celebrate the Festival of Lights!';
      return 'Hope this Diwali brought you happiness & prosperity! 🙏';
    }
  },

  async mounted() {
    await this.checkDiwaliSeason();
  },

  methods: {
    /**
     * Parse a date string safely in LOCAL time (avoids UTC midnight shift bug).
     * Accepts: "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ", etc.
     */
    parseDateLocal(dateStr) {
      if (!dateStr) return null;
      // Strip time/timezone — only use the date part
      const datePart = String(dateStr).slice(0, 10); // "YYYY-MM-DD"
      const [y, m, d] = datePart.split('-').map(Number);
      if (!y || !m || !d) return null;
      // new Date(y, m-1, d) constructs in LOCAL time, no UTC shift
      return new Date(y, m - 1, d);
    },

    async checkDiwaliSeason() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/holidays/all',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data?.success) return;

        const holidays = response.data.data || [];

        // today at LOCAL midnight – no UTC offset involved
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisYear = today.getFullYear();

        // Find ALL Diwali holidays (name contains "diwali", case-insensitive)
        const diwaliHolidays = holidays.filter(h =>
          h.is_active !== false &&
          h.name && h.name.toLowerCase().includes('diwali')
        );

        if (!diwaliHolidays.length) return;

        for (const diwali of diwaliHolidays) {
          let diwaliDateObj = null;

          if (diwali.is_recurring && diwali.month_day) {
            // ---- Recurring holiday: use month-day string (MM-DD) ----
            const parts = String(diwali.month_day).split('-');
            if (parts.length === 2) {
              const mm = parseInt(parts[0], 10);
              const dd = parseInt(parts[1], 10);

              // Check this year first
              diwaliDateObj = new Date(thisYear, mm - 1, dd);

              // Window edges for this year
              const wsThis = new Date(diwaliDateObj); wsThis.setDate(wsThis.getDate() - 2);
              const weThis = new Date(diwaliDateObj); weThis.setDate(weThis.getDate() + 1);

              if (today < wsThis) {
                // Too early even for this year — keep this year (might still be upcoming)
              } else if (today > weThis) {
                // Window for this year has ended — jump to next year
                diwaliDateObj = new Date(thisYear + 1, mm - 1, dd);
              }
              // else: today is within or exactly at boundary of this year → keep this year
            }
          } else if (diwali.date) {
            // ---- Fixed-date holiday: parse LOCAL to avoid UTC midnight shift ----
            diwaliDateObj = this.parseDateLocal(diwali.date);
          }

          if (!diwaliDateObj || isNaN(diwaliDateObj.getTime())) continue;

          // ---- Decoration window: (diwaliDate - 2 days) to (diwaliDate + 1 day), inclusive ----
          const windowStart = new Date(diwaliDateObj);
          windowStart.setDate(windowStart.getDate() - 2);

          const windowEnd = new Date(diwaliDateObj);
          windowEnd.setDate(windowEnd.getDate() + 1);

          console.debug(
            `[DiwaliDecoration] "${diwali.name}" window: ${windowStart.toDateString()} → ${windowEnd.toDateString()} | today: ${today.toDateString()} | match: ${today >= windowStart && today <= windowEnd}`
          );

          if (today >= windowStart && today <= windowEnd) {
            this.isDiwaliSeason = true;
            this.diwaliDate = diwaliDateObj;

            // Show the banner only once per session per diwali date
            const bannerKey = `diwali_banner_dismissed_${diwaliDateObj.getFullYear()}-${String(diwaliDateObj.getMonth()+1).padStart(2,'0')}-${String(diwaliDateObj.getDate()).padStart(2,'0')}`;
            if (!sessionStorage.getItem(bannerKey)) {
              setTimeout(() => { this.showBanner = true; }, 1200);
            }
            break; // found a matching diwali window — stop checking
          }
        }
      } catch (err) {
        // Silently fail – decoration is non-critical
        console.debug('[DiwaliDecoration] Could not check holiday:', err?.message);
      }
    },

    closeBanner() {
      this.showBanner = false;
      if (this.diwaliDate) {
        const key = `diwali_banner_dismissed_${this.diwaliDate.toISOString().slice(0, 10)}`;
        sessionStorage.setItem(key, '1');
      }
    },

    // Random-looking but deterministic style helpers
    diyaStyle(n, total) {
      const left = ((n - 1) / (total - 1)) * 100;
      const delay = ((n * 0.37) % 2).toFixed(2);
      return { left: `${left}%`, animationDelay: `${delay}s` };
    },

    bulbStyle(n) {
      const colors = ['#ff4444','#ff9900','#ffe500','#44cc44','#4499ff','#ff44cc','#ff6600','#cc44ff'];
      const color = colors[(n - 1) % colors.length];
      const delay = ((n * 0.25) % 2).toFixed(2);
      return { '--bulb-color': color, animationDelay: `${delay}s` };
    },

    sparkleStyle(n) {
      const left = ((n * 17 + 3) % 97).toFixed(1);
      const top = ((n * 13 + 7) % 85).toFixed(1);
      const delay = ((n * 0.31) % 3).toFixed(2);
      const size = (12 + (n % 10)).toFixed(0);
      const colors = ['#FFD700','#FF8C00','#FF4500','#FF69B4','#FFA500','#FFEC00'];
      const color = colors[n % colors.length];
      return {
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        fontSize: `${size}px`,
        color,
      };
    },
  }
};
</script>

<style scoped>
/* ============================================================
   DIWALI DECORATION ROOT LAYER
   – pointer-events: none so it never blocks clicks
============================================================ */
.diwali-decoration-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

/* ---- Diya rows (top / bottom) ---- */
.diwali-diya-row {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
}
.diwali-diya-row.top  { top: 0; }
.diwali-diya-row.bottom { bottom: 0; }

.diya {
  font-size: 22px;
  display: inline-block;
  animation: diyaPulse 2s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 6px #FFA500) drop-shadow(0 0 12px #FFD700);
}

@keyframes diyaPulse {
  0%   { transform: scale(1) rotate(-5deg);   filter: drop-shadow(0 0 4px #FFA500); }
  100% { transform: scale(1.18) rotate(5deg); filter: drop-shadow(0 0 14px #FFD700) drop-shadow(0 0 24px #FF6B00); }
}

/* ---- String lights ---- */
.diwali-lights-string {
  position: absolute;
  top: 26px;
  display: flex;
  gap: 18px;
  align-items: flex-end;
}
.diwali-lights-string.top-left  { left: 0; }
.diwali-lights-string.top-right { right: 0; flex-direction: row-reverse; }

.light-bulb {
  width: 10px;
  height: 16px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: var(--bulb-color, #ff4444);
  box-shadow: 0 0 6px 2px var(--bulb-color, #ff4444), 0 0 14px 4px var(--bulb-color, #ff4444);
  display: inline-block;
  animation: bulbGlow 1.5s ease-in-out infinite alternate;
  position: relative;
}
.light-bulb::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 3px;
  width: 4px;
  height: 5px;
  background: #666;
  border-radius: 2px;
}

@keyframes bulbGlow {
  0%   { opacity: 0.6; transform: scale(0.9); }
  100% { opacity: 1;   transform: scale(1.1); }
}

/* ---- Sparkles ---- */
.diwali-sparkles {
  position: absolute;
  inset: 0;
}
.sparkle {
  position: absolute;
  animation: sparkleFly 3s ease-in-out infinite;
  opacity: 0;
  user-select: none;
}
@keyframes sparkleFly {
  0%   { opacity: 0;   transform: translateY(0)   scale(0.5) rotate(0deg); }
  40%  { opacity: 1;   transform: translateY(-20px) scale(1.2) rotate(60deg); }
  80%  { opacity: 0.5; transform: translateY(-10px) scale(0.9) rotate(120deg); }
  100% { opacity: 0;   transform: translateY(0)   scale(0.5) rotate(180deg); }
}

/* ---- Firework corners ---- */
.firework-corner {
  position: absolute;
  font-size: 48px;
  animation: fireworkPop 2.5s ease-in-out infinite;
}
.top-left-fw  { top: 28px; left: 14px; }
.top-right-fw { top: 28px; right: 14px; }

@keyframes fireworkPop {
  0%,100% { transform: scale(0.8); opacity: 0.5; }
  50%      { transform: scale(1.3); opacity: 1;   }
}

/* ---- Lanterns ---- */
.diwali-lanterns {
  position: absolute;
  top: 50px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.diwali-lanterns.left  { left: 6px; }
.diwali-lanterns.right { right: 6px; }

.lantern {
  font-size: 28px;
  display: inline-block;
  animation: lanternSwing 3s ease-in-out infinite alternate;
  animation-delay: var(--delay, 0s);
  transform-origin: top center;
  filter: drop-shadow(0 0 8px #FF8C00);
}
@keyframes lanternSwing {
  0%   { transform: rotate(-8deg) translateX(var(--x, 0px)); }
  100% { transform: rotate( 8deg) translateX(calc(-1 * var(--x, 0px))); }
}

/* ============================================================
   DIWALI BANNER  (pointer-events: auto so user can close it)
============================================================ */
.diwali-banner {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  pointer-events: auto;
  background: linear-gradient(135deg, #2d1200 0%, #7a2d00 40%, #2d1200 100%);
  border: 2px solid #FFD700;
  border-radius: 18px;
  box-shadow: 0 0 24px 6px rgba(255,165,0,0.5), 0 8px 32px rgba(0,0,0,0.5);
  padding: 14px 28px 14px 20px;
  min-width: 280px;
  max-width: 90vw;
  cursor: pointer;
  animation: bannerGlow 2s ease-in-out infinite alternate;
}

@keyframes bannerGlow {
  0%   { box-shadow: 0 0 18px 4px rgba(255,165,0,0.4), 0 8px 24px rgba(0,0,0,0.5); }
  100% { box-shadow: 0 0 36px 10px rgba(255,215,0,0.7), 0 8px 32px rgba(0,0,0,0.6); }
}

.banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-emoji {
  font-size: 28px;
  animation: diyaPulse 1.8s ease-in-out infinite alternate;
}

.banner-text {
  flex: 1;
  text-align: center;
}

.banner-title {
  font-size: 17px;
  font-weight: 700;
  color: #FFD700;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px #FF8C00;
}

.banner-subtitle {
  font-size: 12px;
  color: #FFE4B5;
  margin-top: 2px;
  opacity: 0.9;
}

.banner-close-btn {
  position: absolute;
  top: 6px;
  right: 10px;
  background: none;
  border: none;
  color: #FFD700;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.75;
  pointer-events: auto;
}
.banner-close-btn:hover { opacity: 1; }

/* ---- Banner slide transition ---- */
.banner-slide-enter-active, .banner-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.banner-slide-enter-from, .banner-slide-leave-to {
  transform: translateX(-50%) translateY(80px);
  opacity: 0;
}

/* ---- Responsive: hide lanterns on very small screens ---- */
@media (max-width: 480px) {
  .diwali-lanterns,
  .diwali-lights-string { display: none; }
  .diya { font-size: 16px; }
}
</style>

