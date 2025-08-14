// Feedback System with EmailJS Integration
// Your EmailJS configuration
const EMAILJS_CONFIG = {
    publicKey: 'BHHZFVMm0iLafKg4j',
    serviceId: 'service_x3zku8f',
    templateId: 'template_abyr59i'
};

// Initialize Notyf for notifications (same style as other files)
const notyf = new Notyf({
    duration: 2500,
    position: { x: 'left', y: 'top' },
    types: [
        {
            type: 'success',
            background: '#222',
            icon: false,
            className: 'notyf-success pixel-corners-small',
            duration: 5000,
            dismissible: true
        },
        {
            type: 'error',
            background: '#222',
            icon: false,
            className: 'notyf-error pixel-corners-small'
        },
        {
            type: 'info',
            background: '#222',
            icon: false,
            className: 'notyf-info pixel-corners-small'
        },
        {
            type: 'xp',
            background: '#232323',
            icon: false,
            className: 'notyf-xp pixel-corners-small'
        },
    ]
});

// Initialize EmailJS
function initEmailJS() {
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: EMAILJS_CONFIG.publicKey,
            });
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Send feedback via EmailJS with better error handling
async function sendFeedbackEmail(feedbackData) {
    const emailJSReady = initEmailJS();

    if (!emailJSReady) {
        throw new Error('EmailJS not available - make sure the library is loaded');
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
        user_email: feedbackData.email || 'Not provided',
        feedback_type: feedbackData.type,
        timestamp: new Date(feedbackData.timestamp).toLocaleString(),
        user_message: feedbackData.message,
        player_level: feedbackData.gameStats.level,
        player_coins: feedbackData.gameStats.zenCoins,
        player_hp: feedbackData.gameStats.currentHP,
        user_agent: feedbackData.userAgent
    };

    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        return response;
    } catch (error) {
        // Provide more specific error messages
        if (error.status === 400) {
            throw new Error('Invalid email template or parameters');
        } else if (error.status === 401) {
            throw new Error('EmailJS authentication failed');
        } else if (error.status === 402) {
            throw new Error('EmailJS quota exceeded');
        } else if (error.status >= 500) {
            throw new Error('EmailJS server error - please try again later');
        } else {
            throw new Error(`Email send failed: ${error.message}`);
        }
    }
}

// Main feedback system initialization
function initFeedbackSystem() {
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedbackBtn = document.getElementById('close-feedback');
    const cancelFeedbackBtn = document.getElementById('cancel-feedback');
    const feedbackForm = document.getElementById('feedback-form');

    if (!feedbackBtn || !feedbackModal) {
        return;
    }

    // Show feedback modal
    feedbackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        feedbackModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Hide feedback modal
    function closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const form = document.getElementById('feedback-form');

        if (modal) {
            modal.style.display = 'none';
        }

        document.body.style.overflow = 'auto';

        if (form) {
            form.reset();
        }
    }

    // Close modal events
    closeFeedbackBtn.addEventListener('click', closeFeedbackModal);
    cancelFeedbackBtn.addEventListener('click', closeFeedbackModal);

    // Close modal when clicking outside
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('feedback-modal');
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeFeedbackModal();
        }
    });

    // Handle form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const feedbackType = document.getElementById('feedback-type').value;
        const feedbackMessage = document.getElementById('feedback-message').value.trim();
        const feedbackEmail = document.getElementById('feedback-email').value.trim();

        // Form validation
        if (!feedbackType || !feedbackMessage) {
            notyf.error('Please fill in all required fields!');
            return;
        }

        if (feedbackMessage.length < 10) {
            notyf.error('Please provide more detailed feedback (at least 10 characters).');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#feedback-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Prepare feedback data
            const feedbackData = {
                type: feedbackType,
                message: feedbackMessage,
                email: feedbackEmail,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                gameStats: {
                    level: gameStats.loadStats().level,
                    zenCoins: gameStats.loadStats().zenCoins,
                    currentHP: gameStats.loadStats().currentHP
                }
            };

            // Store feedback locally as backup
            const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
            existingFeedback.push(feedbackData);
            localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

            // Send via EmailJS
            await sendFeedbackEmail(feedbackData);

            // Success!
            notyf.success('Thank you! Your feedback has been sent successfully.');

            // Close modal after success
            setTimeout(() => {
                closeFeedbackModal();
            }, 1000); // Allow time to see success message

            // Award XP bonus
            setTimeout(() => {
                const xpReward = 15;
                if (typeof gameStats !== 'undefined') {
                    // Temporarily disable showXPMessage to prevent duplicate notification
                    const originalShowXPMessage = typeof showXPMessage !== 'undefined' ? showXPMessage : null;
                    if (originalShowXPMessage) {
                        window.showXPMessage = () => { }; // Temporarily disable
                    }

                    gameStats.awardXP(xpReward);

                    // Restore original function
                    if (originalShowXPMessage) {
                        window.showXPMessage = originalShowXPMessage;
                    }

                    // Show custom feedback XP message with standard styling
                    const iconImg = '<img src="images/icons/xp.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
                    notyf.open({
                        type: 'xp',
                        message: `${iconImg}+${xpReward} XP - Bonus: Providing feedback!`
                    });
                }
            }, 2000); // Delay XP notification

        } catch (error) {
            // Show detailed error message
            notyf.error(`Failed to send feedback: ${error.message}`);

        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Developer tools - view stored feedback
function viewAllFeedback() {
    const feedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    console.log(`=== ZENQUEST FEEDBACK (${feedback.length} entries) ===`);

    if (feedback.length === 0) {
        console.log('No feedback found.');
        return [];
    }

    feedback.forEach((entry, index) => {
        console.log(`\n--- Feedback #${index + 1} ---`);
        console.log(`Type: ${entry.type}`);
        console.log(`Message: ${entry.message}`);
        console.log(`Email: ${entry.email}`);
        console.log(`Level: ${entry.gameStats.level} | Coins: ${entry.gameStats.zenCoins} | HP: ${entry.gameStats.currentHP}`);
        console.log(`Timestamp: ${entry.timestamp}`);
    });

    return feedback;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initFeedbackSystem();
});

// Export for use in other files if needed
if (typeof window !== 'undefined') {
    window.FeedbackSystem = {
        initFeedbackSystem,
        sendFeedbackEmail,
        viewAllFeedback
    };
}
