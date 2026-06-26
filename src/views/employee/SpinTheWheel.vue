<template>
  <div class="game-wheel-page">
    <!-- 🎮 header with game vibe -->
    <div class="game-header">
      <div class="header-left">
        <div class="game-icon-bounce">
          <i class="fas fa-mug-hot"></i>
        </div>
        <div>
          <h1>🍵 Tea Roulette</h1>
          <p class="sub-gamertag">2 lucky winners! 🎉</p>
        </div>
      </div>
      <div class="header-right">
        <span class="player-count-badge">
          <i class="fas fa-user-astronaut"></i>
          {{ activeParticipants.length }} active players
        </span>
        <span class="player-count-badge hidden-badge" v-if="hiddenParticipants.length > 0">
          <i class="fas fa-user-slash"></i>
          {{ hiddenParticipants.length }} hidden
        </span>
      </div>
    </div>

    <!-- 🎡 wheel arena with dual pointers -->
    <div class="wheel-arena">
      <div class="wheel-glow"></div>
      <div class="wheel-border-glow"></div>
      <canvas ref="wheelCanvas" width="600" height="600"></canvas>
      
      
      <div class="center-button" @click="spinWheel" :class="{ 'spinning': isSpinning }">
        <i class="fas fa-dice"></i>
        <span>{{ isSpinning ? '🎲' : 'SPIN!' }}</span>
      </div>
      <div class="wheel-rings">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
      </div>
    </div>

    <!-- 🏆 result with 2 winners -->
    <div class="result-box" :class="{ 'result-pop': selectedPeople.length === 2, 'result-drama': isSpinning }">
      <div class="result-inner">
        <span class="result-emoji">🎯</span>
        <div class="winners-container">
          <div v-if="selectedPeople.length === 0" class="waiting-text">waiting...</div>
          <div v-else class="winner-items">
            <div v-for="(person, idx) in selectedPeople" :key="idx" class="winner-item">
              <span class="winner-number">#{{ idx + 1 }}</span>
              <span class="result-name">{{ person }}</span>
              <span class="winner-emoji">{{ idx === 0 ? '👑' : '🌟' }}</span>
            </div>
          </div>
        </div>
        <span v-if="selectedPeople.length === 2" class="result-badge">☕ today's heroes</span>
      </div>
      <canvas ref="confettiCanvas" class="confetti-canvas" v-show="selectedPeople.length === 2"></canvas>
    </div>

    <!-- 🧑‍🤝‍🧑 player management -->
    <div class="player-section">
      <div class="section-header">
        <i class="fas fa-gamepad"></i>
        <span>Players</span>
        <span class="count-badge">{{ activeParticipants.length }}</span>
        <button class="reset-btn" @click="resetWheel" title="Reset wheel">
          <i class="fas fa-undo-alt"></i>
        </button>
        <button class="reset-btn toggle-hidden-btn" @click="showHidden = !showHidden" title="Toggle hidden players">
          <i class="fas fa-eye" v-if="!showHidden"></i>
          <i class="fas fa-eye-slash" v-else></i>
        </button>
      </div>

      <div class="add-player">
        <input
          type="text"
          v-model="newName"
          placeholder="Add player name..."
          @keyup.enter="addParticipant"
          maxlength="20"
          class="player-input"
        />
        <button @click="addParticipant" :disabled="!newName.trim()" class="add-btn">
          <i class="fas fa-plus-circle"></i> Add
        </button>
      </div>

      <div class="player-list">
        <!-- Active Players -->
        <div
          v-for="(p, idx) in activeParticipants"
          :key="'active-' + idx"
          class="player-item"
          :class="{ 
            'winner-glow': selectedPeople.includes(p), 
            'winner-1': selectedPeople.length === 2 && selectedPeople[0] === p,
            'winner-2': selectedPeople.length === 2 && selectedPeople[1] === p
          }"
        >
          <span class="player-avatar">{{ getAvatar(p) }}</span>
          <span class="player-name">{{ p }}</span>
          <span class="status-badge active">✅ Active</span>
          <span v-if="selectedPeople.length === 2 && selectedPeople[0] === p" class="winner-tag gold">🥇 WINNER</span>
          <span v-if="selectedPeople.length === 2 && selectedPeople[1] === p" class="winner-tag silver">🥈 WINNER</span>
          <button @click="toggleHidePlayer(p)" class="hide-btn" title="Hide player">
            <i class="fas fa-eye-slash"></i>
          </button>
          <button @click="removeParticipant(idx, true)" class="remove-btn">
            <i class="fas fa-skull"></i>
          </button>
        </div>

        <!-- Hidden Players -->
        <div v-if="showHidden && hiddenParticipants.length > 0" class="hidden-section">
          <div class="hidden-divider">
            <span>🙈 Hidden Players</span>
          </div>
          <div
            v-for="(p, idx) in hiddenParticipants"
            :key="'hidden-' + idx"
            class="player-item hidden-player"
          >
            <span class="player-avatar">{{ getAvatar(p) }}</span>
            <span class="player-name">{{ p }}</span>
            <span class="status-badge hidden">🙈 Hidden</span>
            <button @click="toggleHidePlayer(p)" class="unhide-btn" title="Show player">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="removeParticipant(idx, false)" class="remove-btn">
              <i class="fas fa-skull"></i>
            </button>
          </div>
        </div>

        <div v-if="!activeParticipants.length && !hiddenParticipants.length" class="empty-state">
          <i class="fas fa-ghost"></i>
          <p>No players yet... add some!</p>
        </div>
      </div>
    </div>

    <!-- 🎯 funny footer -->
    <div class="game-footer">
      <div class="footer-content">
        <i class="fas fa-fire"></i>
        <span>{{ activeParticipants.length >= 2 ? '2 lucky winners will be chosen! 🎰' : 'Add at least 2 active players to start! 🔥' }}</span>
        <i class="fas fa-fire"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TeaWheel",
  data() {
    return {
      allParticipants: [
        { name: 'Ajay', hidden: false },
        { name: 'Amar', hidden: false },
        { name: 'Prathmesh', hidden: false },
        { name: 'Dipesh', hidden: false },
        { name: 'Aviraj', hidden: false },
        { name: 'Pranav', hidden: false },
        { name: 'Saurabh', hidden: false },
        { name: 'Atharva', hidden: false }
      ],
      newName: '',
      selectedPeople: [],
      isSpinning: false,
      animationFrame: null,
      confettiFrame: null,
      currentAngle: 0,
      spinVelocity: 0,
      wheelSegments: [],
      confettiPieces: [],
      showHidden: false,
      colors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#FF9F1C', '#B8A9C9', '#F7DC6F', '#82CCDD',
        '#F1948A', '#82E0AA', '#85C1E9', '#F8C471', '#D7BDE2',
        '#FF85A1', '#7B68EE', '#FFD93D', '#6BCB77', '#4D96FF'
      ],
      emojis: ['🦊', '🐼', '🐨', '🦁', '🐯', '🐧', '🐱', '🐶', '🐺', '🦄', '🐲', '🦉', '🐸', '🐵', '🦝']
    };
  },
  computed: {
    activeParticipants() {
      return this.allParticipants.filter(p => !p.hidden).map(p => p.name);
    },
    hiddenParticipants() {
      return this.allParticipants.filter(p => p.hidden).map(p => p.name);
    }
  },
  watch: {
    allParticipants: {
      deep: true,
      handler() {
        this.drawWheel();
        // Remove selected people if they're no longer in the active list
        this.selectedPeople = this.selectedPeople.filter(p => this.activeParticipants.includes(p));
        if (this.selectedPeople.length === 0) {
          this.stopConfetti();
        }
      }
    }
  },
  mounted() {
    this.drawWheel();
  },
  methods: {
    getAvatar(name) {
      const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return this.emojis[hash % this.emojis.length];
    },
    addParticipant() {
      const name = this.newName.trim();
      if (name && !this.allParticipants.some(p => p.name === name)) {
        this.allParticipants.push({ name, hidden: false });
        this.newName = '';
        this.playSound('add');
      } else if (this.allParticipants.some(p => p.name === name)) {
        alert('⚠️ Player already exists!');
        this.newName = '';
      }
    },
    removeParticipant(index, isActive) {
      const list = isActive ? this.activeParticipants : this.hiddenParticipants;
      const name = list[index];
      const playerIndex = this.allParticipants.findIndex(p => p.name === name);
      if (playerIndex !== -1) {
        this.allParticipants.splice(playerIndex, 1);
        this.selectedPeople = this.selectedPeople.filter(p => p !== name);
        if (this.selectedPeople.length === 0) {
          this.stopConfetti();
        }
        this.playSound('remove');
      }
    },
    toggleHidePlayer(name) {
      const player = this.allParticipants.find(p => p.name === name);
      if (player) {
        player.hidden = !player.hidden;
        // Remove from selected if hidden
        if (player.hidden) {
          this.selectedPeople = this.selectedPeople.filter(p => p !== name);
          if (this.selectedPeople.length === 0) {
            this.stopConfetti();
          }
        }
        this.playSound('toggle');
      }
    },
    drawWheel() {
      const canvas = this.$refs.wheelCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 16;

      ctx.clearRect(0, 0, width, height);

      const count = this.activeParticipants.length;
      if (count === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, '#2d2d44');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.fillStyle = '#8888aa';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('🎮 ADD PLAYERS', centerX, centerY);
        ctx.shadowBlur = 0;
        return;
      }

      const angleStep = (2 * Math.PI) / count;
      this.wheelSegments = [];

      for (let i = 0; i < count; i++) {
        const startAngle = i * angleStep + this.currentAngle;
        const endAngle = startAngle + angleStep;
        const color = this.colors[i % this.colors.length];

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, this.lightenColor(color, 40));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        this.wheelSegments.push({
          startAngle,
          endAngle,
          label: this.activeParticipants[i],
          color
        });

        const midAngle = startAngle + angleStep / 2;
        const textRadius = radius * 0.7;
        const x = centerX + Math.cos(midAngle) * textRadius;
        const y = centerY + Math.sin(midAngle) * textRadius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(midAngle + (midAngle > Math.PI / 2 ? Math.PI : 0));
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#1a1a2e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 10;
        ctx.fillText(this.activeParticipants[i], 0, 0);
        ctx.restore();
      }

      // Outer glow ring
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner decorative ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot with premium glow
      const grad2 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
      grad2.addColorStop(0, '#fbbf24');
      grad2.addColorStop(0.5, '#f59e0b');
      grad2.addColorStop(1, '#b45309');
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
      ctx.fillStyle = grad2;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Inner dot
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    },

    lightenColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    },

    spinWheel() {
      if (this.isSpinning) return;
      if (this.activeParticipants.length < 2) {
        alert('⚠️ Need at least 2 active players to select 2 winners!');
        return;
      }

      this.isSpinning = true;
      this.selectedPeople = [];
      this.stopConfetti();

      // Pick 2 unique winners
      const winners = this.pickTwoWinners();
      
      // Calculate target angles for both winners
      const targetAngles = this.getAnglesForWinners(winners);
      
      // Use the first winner's angle as the primary target
      const targetAngle = targetAngles[0];
      
      // Calculate spin duration
      const totalSpins = 5 + Math.random() * 3;
      const totalAngle = totalSpins * 2 * Math.PI + targetAngle;
      
      const startAngle = this.currentAngle;
      const endAngle = startAngle + totalAngle;
      const duration = 3500 + Math.random() * 1000;
      const startTime = performance.now();

      const animateSpin = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        this.currentAngle = startAngle + (endAngle - startAngle) * easeOut;
        
        this.drawWheel();

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animateSpin);
        } else {
          this.currentAngle = endAngle;
          this.drawWheel();
          this.isSpinning = false;
          this.selectedPeople = winners;
          this.playSound('win');
          this.startConfetti();
        }
      };

      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.playSound('spin');
      this.animationFrame = requestAnimationFrame(animateSpin);
    },

    pickTwoWinners() {
      // Shuffle and pick 2 unique winners from active participants
      const shuffled = [...this.activeParticipants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      const winners = [];
      for (let i = 0; i < Math.min(2, shuffled.length); i++) {
        winners.push(shuffled[i]);
      }
      
      // If we somehow got less than 2, fill with random active participants
      while (winners.length < 2) {
        const random = this.activeParticipants[Math.floor(Math.random() * this.activeParticipants.length)];
        if (!winners.includes(random)) {
          winners.push(random);
        }
      }
      
      return winners;
    },

    getAnglesForWinners(winners) {
      const angles = [];
      
      for (let winner of winners) {
        // Find the segment for each winner
        let found = false;
        for (let seg of this.wheelSegments) {
          if (seg.label === winner) {
            const segmentSize = seg.endAngle - seg.startAngle;
            const randomOffset = (Math.random() - 0.5) * segmentSize * 0.4;
            angles.push((seg.startAngle + seg.endAngle) / 2 + randomOffset);
            found = true;
            break;
          }
        }
        if (!found) {
          angles.push(this.currentAngle);
        }
      }
      
      return angles;
    },

    startConfetti() {
      this.stopConfetti();
      const canvas = this.$refs.confettiCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.offsetWidth || 400;
      canvas.height = 120;

      this.confettiPieces = [];
      const colors = ['#FF6B6B', '#4ECDC4', '#FFEAA7', '#FF9F1C', '#DDA0DD', '#F7DC6F', '#FF85A1', '#6BCB77', '#7B68EE', '#FFD93D'];
      for (let i = 0; i < 120; i++) {
        this.confettiPieces.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          w: 5 + Math.random() * 10,
          h: 3 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          speed: 1 + Math.random() * 4,
          angle: Math.random() * Math.PI * 2,
          wobble: Math.random() * 0.15,
        });
      }

      const animateConfetti = () => {
        if (this.selectedPeople.length !== 2) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.confettiPieces.forEach(p => {
          p.x += Math.cos(p.angle) * p.speed * 0.6;
          p.y += Math.sin(p.angle) * p.speed * 0.6 + 0.8;
          p.rotation += 0.03;
          p.angle += p.wobble;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
          ctx.restore();
        });

        this.confettiFrame = requestAnimationFrame(animateConfetti);
      };

      animateConfetti();
    },

    stopConfetti() {
      if (this.confettiFrame) {
        cancelAnimationFrame(this.confettiFrame);
        this.confettiFrame = null;
      }
      const canvas = this.$refs.confettiCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    playSound(type) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'spin') {
          oscillator.frequency.value = 400;
          gainNode.gain.value = 0.05;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 80);
        } else if (type === 'win') {
          oscillator.frequency.value = 523;
          gainNode.gain.value = 0.08;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 659;
            setTimeout(() => {
              oscillator.frequency.value = 784;
              setTimeout(() => oscillator.stop(), 150);
            }, 120);
          }, 120);
        } else if (type === 'add') {
          oscillator.frequency.value = 600;
          gainNode.gain.value = 0.04;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 60);
        } else if (type === 'remove') {
          oscillator.frequency.value = 300;
          gainNode.gain.value = 0.04;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 60);
        } else if (type === 'toggle') {
          oscillator.frequency.value = 500;
          gainNode.gain.value = 0.04;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 50);
        }
      } catch(e) { /* silent fallback */ }
    },

    resetWheel() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.isSpinning = false;
      this.spinVelocity = 0;
      this.currentAngle = 0;
      this.selectedPeople = [];
      this.stopConfetti();
      this.drawWheel();
    }
  },
  beforeUnmount() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.stopConfetti();
  }
};
</script>

<style scoped>
/* ... (all existing styles remain the same) ... */

/* Additional styles for hidden feature */
.hidden-badge {
  background: rgba(255, 107, 107, 0.12);
  border-color: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.toggle-hidden-btn {
  margin-left: 4px;
}

.hidden-section {
  margin-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 8px;
}

.hidden-divider {
  text-align: center;
  font-size: 12px;
  color: #666688;
  padding: 6px 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.hidden-divider span {
  background: rgba(255,255,255,0.03);
  padding: 2px 16px;
  border-radius: 20px;
}

.player-item.hidden-player {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255,255,255,0.02);
  opacity: 0.7;
}

.status-badge {
  font-size: 10px;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(75, 181, 67, 0.12);
  color: #4bc543;
}

.status-badge.hidden {
  background: rgba(255, 107, 107, 0.08);
  color: #ff6b6b;
}

.hide-btn, .unhide-btn {
  background: rgba(255,255,255,0.03);
  border: none;
  color: #555577;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.hide-btn:hover {
  background: rgba(255, 107, 107, 0.12);
  color: #ff6b6b;
}

.unhide-btn:hover {
  background: rgba(75, 181, 67, 0.12);
  color: #4bc543;
}

/* Update responsive styles */
@media (max-width: 640px) {
  .status-badge {
    font-size: 9px;
    padding: 1px 8px;
  }
  
  .hide-btn, .unhide-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.game-wheel-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(160deg, #0a0a1a 0%, #1a1a2e 30%, #16213e 60%, #0a0a1a 100%);
  padding: 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.game-wheel-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.1), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.08), transparent),
    radial-gradient(2px 2px at 60% 20%, rgba(255,255,255,0.1), transparent),
    radial-gradient(2px 2px at 80% 60%, rgba(255,255,255,0.08), transparent),
    radial-gradient(2px 2px at 10% 80%, rgba(255,255,255,0.06), transparent),
    radial-gradient(2px 2px at 90% 40%, rgba(255,255,255,0.06), transparent);
  background-size: 200% 200%;
  pointer-events: none;
  z-index: 0;
  animation: bgShift 20s ease-in-out infinite alternate;
}

@keyframes bgShift {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.game-wheel-page > * {
  max-width: 620px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* HEADER */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.game-icon-bounce {
  font-size: 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  padding: 10px 12px;
  border-radius: 18px;
  animation: bounce 2s infinite;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.15);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(5deg); }
}

.header-left h1 {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
  margin: 0;
  line-height: 1.2;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.sub-gamertag {
  font-size: 11px;
  color: #8888aa;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
  -webkit-text-fill-color: #8888aa;
}

.player-count-badge {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.15);
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

/* WHEEL ARENA */
.wheel-arena {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto 8px;
  aspect-ratio: 1/1;
  touch-action: none;
}

.wheel-glow {
  position: absolute;
  top: -30px;
  left: -30px;
  right: -30px;
  bottom: -30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.06), transparent 70%);
  pointer-events: none;
  animation: pulseGlow 3s ease-in-out infinite;
}

.wheel-border-glow {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #fbbf24, #f59e0b, #fbbf24, #f59e0b, #fbbf24);
  opacity: 0.15;
  pointer-events: none;
  animation: spinGlow 10s linear infinite;
}

@keyframes spinGlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

.wheel-arena canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  border-radius: 50%;
  box-shadow: 
    0 0 80px rgba(251, 191, 36, 0.08),
    0 20px 60px rgba(0,0,0,0.5),
    inset 0 0 80px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
}

.wheel-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
}

.ring-1 {
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border-color: rgba(255,255,255,0.03);
}

.ring-2 {
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  border-color: rgba(255,255,255,0.02);
}

.pointer-arrow {
  position: absolute;
  font-size: 28px;
  color: #fbbf24;
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.5), 0 4px 20px rgba(0,0,0,0.5);
  z-index: 5;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.3));
}

.pointer-1 {
  top: -6px;
  left: 25%;
  transform: translateX(-50%);
  animation: pointerBounce1 1.5s ease-in-out infinite;
}

.pointer-2 {
  bottom: -6px;
  right: 25%;
  transform: translateX(50%) rotate(180deg);
  animation: pointerBounce2 1.5s ease-in-out infinite 0.3s;
}

@keyframes pointerBounce1 {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}

@keyframes pointerBounce2 {
  0%, 100% { transform: translateX(50%) rotate(180deg) translateY(0); }
  50% { transform: translateX(50%) rotate(180deg) translateY(6px); }
}

.center-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #3d3d5c, #1a1a2e);
  box-shadow: 
    0 8px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 -2px 10px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 3px solid #fbbf24;
  color: #fbbf24;
  font-weight: 800;
  user-select: none;
  z-index: 4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.center-button:hover {
  transform: translate(-50%, -50%) scale(1.07);
  box-shadow: 0 0 60px rgba(251, 191, 36, 0.2), 0 8px 40px rgba(0,0,0,0.6);
}

.center-button:active {
  transform: translate(-50%, -50%) scale(0.92);
}

.center-button.spinning {
  border-color: #ff6b6b;
  color: #ff6b6b;
  animation: spinPulse 0.4s ease-in-out infinite;
}

@keyframes spinPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(0.94); }
}

.center-button i {
  font-size: 22px;
  margin-bottom: 1px;
}

.center-button span {
  font-size: 12px;
  font-weight: 700;
}

/* RESULT BOX */
.result-box {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 60px;
  padding: 16px 24px;
  margin: 12px 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.05);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 80px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}

.result-box.result-pop {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.06);
  box-shadow: 0 0 60px rgba(251, 191, 36, 0.06), 0 4px 24px rgba(0,0,0,0.2);
}

.result-box.result-drama {
  border-color: #ff6b6b;
  animation: dramaPulse 0.5s ease-in-out infinite;
}

@keyframes dramaPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.97); }
}

.result-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.result-emoji {
  font-size: 30px;
}

.winners-container {
  flex: 1;
  min-width: 120px;
}

.waiting-text {
  font-size: 20px;
  color: #8888aa;
  text-align: center;
}

.winner-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.winner-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 30px;
}

.winner-number {
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 1px 8px;
  border-radius: 20px;
}

.result-name {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.winner-emoji {
  font-size: 20px;
}

.result-badge {
  font-size: 11px;
  background: rgba(251, 191, 36, 0.12);
  padding: 4px 14px;
  border-radius: 30px;
  color: #fbbf24;
  font-weight: 600;
  -webkit-text-fill-color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.1);
}

.confetti-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 60px;
}

/* PLAYER SECTION */
.player-section {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 20px 18px 18px;
  margin-top: 4px;
  border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 17px;
  color: #e8e8ff;
  margin-bottom: 14px;
}

.section-header i {
  color: #fbbf24;
  font-size: 20px;
}

.count-badge {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  border-radius: 30px;
  padding: 0 14px;
  font-size: 14px;
  line-height: 28px;
  margin-left: auto;
  font-weight: 600;
}

.reset-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: #8888aa;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn:hover {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.15);
  transform: rotate(30deg);
}

.add-player {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.player-input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  background: rgba(255,255,255,0.04);
  color: #ffffff;
}

.player-input::placeholder {
  color: #555577;
}

.player-input:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.06);
  background: rgba(255,255,255,0.06);
}

.add-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  padding: 0 24px;
  color: #1a1a2e;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.15);
}

.add-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 8px 30px rgba(251, 191, 36, 0.25);
}

.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.player-list::-webkit-scrollbar {
  width: 4px;
}

.player-list::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
}

.player-list::-webkit-scrollbar-thumb {
  background: #fbbf24;
  border-radius: 10px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.03);
  padding: 8px 14px 8px 12px;
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.3s;
}

.player-item:hover {
  background: rgba(255,255,255,0.06);
}

.player-item.winner-glow {
  background: rgba(251, 191, 36, 0.06);
  border-color: #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.04);
  animation: winnerGlow 1.5s ease-in-out infinite;
}

.player-item.winner-1 {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.08);
}

.player-item.winner-2 {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.08);
}

@keyframes winnerGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.02); }
  50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.06); }
}

.player-avatar {
  font-size: 22px;
}

.player-name {
  font-weight: 500;
  font-size: 15px;
  color: #d0d0ee;
  flex: 1;
}

.winner-tag {
  font-size: 10px;
  padding: 2px 12px;
  border-radius: 20px;
  font-weight: 700;
}

.winner-tag.gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
}

.winner-tag.silver {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  color: #1a1a2e;
}

.remove-btn {
  background: rgba(255,255,255,0.03);
  border: none;
  color: #555577;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.12);
  color: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 28px 10px;
  color: #555577;
}

.empty-state i {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
}

/* FOOTER */
.game-footer {
  margin-top: 16px;
  padding: 12px 0;
  width: 100%;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.02);
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.03);
  color: #666688;
  font-size: 14px;
  font-weight: 500;
}

.footer-content i {
  color: #fbbf24;
  font-size: 16px;
  animation: fireFlicker 1.5s ease-in-out infinite;
}

@keyframes fireFlicker {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .game-wheel-page {
    padding: 12px;
  }
  
  .game-header {
    padding: 12px 16px;
    border-radius: 20px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .game-icon-bounce {
    font-size: 24px;
    padding: 8px 10px;
    border-radius: 14px;
  }
  
  .center-button {
    width: 64px;
    height: 64px;
  }
  
  .center-button i {
    font-size: 18px;
  }
  
  .center-button span {
    font-size: 10px;
  }
  
  .result-name {
    font-size: 18px;
  }
  
  .result-box {
    min-height: 70px;
    padding: 12px 16px;
    border-radius: 40px;
  }
  
  .add-player {
    flex-wrap: wrap;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
  
  .player-count-badge {
    font-size: 11px;
    padding: 6px 12px;
  }
  
  .pointer-arrow {
    font-size: 20px;
  }
  
  .pointer-1 {
    top: -4px;
    left: 22%;
  }
  
  .pointer-2 {
    bottom: -4px;
    right: 22%;
  }
  
  .player-section {
    padding: 14px 12px 12px;
    border-radius: 20px;
  }
  
  .footer-content {
    font-size: 12px;
    padding: 8px 16px;
  }
  
  .winner-item {
    padding: 2px 10px;
  }
}

@media (max-width: 400px) {
  .header-left h1 {
    font-size: 17px;
  }
  
  .game-icon-bounce {
    font-size: 20px;
    padding: 6px 8px;
  }
  
  .center-button {
    width: 56px;
    height: 56px;
  }
  
  .center-button i {
    font-size: 15px;
  }
  
  .center-button span {
    font-size: 9px;
  }
  
  .result-name {
    font-size: 16px;
  }
  
  .result-box {
    min-height: 60px;
    padding: 10px 14px;
  }
  
  .player-item {
    padding: 6px 10px 6px 8px;
  }
  
  .player-name {
    font-size: 13px;
  }
  
  .player-avatar {
    font-size: 18px;
  }
  
  .sub-gamertag {
    font-size: 10px;
  }
  
  .pointer-arrow {
    font-size: 16px;
  }
  
  .pointer-1 {
    top: -2px;
    left: 20%;
  }
  
  .pointer-2 {
    bottom: -2px;
    right: 20%;
  }
}
</style>