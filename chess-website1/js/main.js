// Main JavaScript file - Application initialization and utilities
class ChessApp {
    constructor() {
        this.game = null;
        this.currentSection = 'home';
        this.init();
    }

    init() {
        console.log('Chess Master App Initialized');
        
        // Initialize game
        this.game = new ChessGame();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Smooth scrolling for navigation
        this.setupSmoothScrolling();
        
        // Update initial UI
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.navigateTo(target);
            });
        });

        // CTA Button
        document.getElementById('startPlaying').addEventListener('click', () => {
            this.navigateTo('game-section');
        });

        // Game controls are handled in game.js
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    navigateTo(section) {
        this.currentSection = section;
        const targetElement = document.getElementById(section);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateUI() {
        // Update any global UI elements
        this.updateGameInfo();
    }

    updateGameInfo() {
        // Global game info updates can go here
    }

    // Utility functions
    static showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new ChessApp();
});