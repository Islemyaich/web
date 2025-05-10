class GlobalNotifications {
    constructor() {
        this.notifications = [];
        this.checkInterval = 30000; // Check every 30 seconds
        this.initialized = false;
        this.starsVisible = false;
        this.sounds = {
            reminder: this.createAudioElement('reminder.mp3'), // For medications
            alert: this.createAudioElement('alert.mp3')       // For appointments
        };
    }

    // Creates a reusable audio element
    createAudioElement(src) {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto'; // Preload for instant playback
        return audio;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        this.injectStyles();
        this.createContainers();
        this.createStarElements();
        this.loadNotifications();
        this.startChecking();
        this.requestPermission();
    }

    injectStyles() {
        const styleId = 'global-notifications-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Notification Styles with Animated Background */
            .global-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                margin: auto;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                overflow: auto;
                background: linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%);
                animation: gradient 15s ease infinite;
                background-size: 400% 400%;
                background-attachment: fixed;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                z-index: 10000;
                max-width: 350px;
                color: white;
                border-left: 5px solid #007e81;
                animation: bounceInDown 0.6s forwards, gradient 15s ease infinite;
            }

            @keyframes gradient {
                0% {
                    background-position: 0% 0%;
                }
                50% {
                    background-position: 100% 100%;
                }
                100% {
                    background-position: 0% 0%;
                }
            }

            @keyframes bounceInDown {
                0% {
                    opacity: 0;
                    transform: translateY(-200px);
                }
                60% {
                    opacity: 1;
                    transform: translateY(30px);
                }
                80% {
                    transform: translateY(-10px);
                }
                100% {
                    transform: translateY(0);
                }
            }

            /* Stars background (only during notifications) */
            .stars-bg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                opacity: 0;
                transition: opacity 1s ease;
                pointer-events: none;
                background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
                overflow: hidden;
            }

            .stars-bg.active {
                opacity: 1;
            }

            #stars {
                width: 1px;
                height: 1px;
                background: transparent;
                box-shadow: ${this.generateStarShadows(700)};
                animation: animStar 50s linear infinite;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            #stars2 {
                width: 2px;
                height: 2px;
                background: transparent;
                box-shadow: ${this.generateStarShadows(200)};
                animation: animStar 100s linear infinite;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            #stars3 {
                width: 3px;
                height: 3px;
                background: transparent;
                box-shadow: ${this.generateStarShadows(100)};
                animation: animStar 150s linear infinite;
                position: absolute;
                top: 0;
                left: 0;
            }

            @keyframes animStar {
                from {
                    transform: translateY(0px);
                }
                to {
                    transform: translateY(-2000px);
                }
            }

            /* Notification content styles */
            .notification-photo {
                width: 50px;
                height: 50px;
                border-radius: 10px;
                object-fit: cover;
                margin-right: 15px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                position: relative;
                z-index: 2;
            }
            
            .notification-initials {
                width: 50px;
                height: 50px;
                border-radius: 10px;
                background: linear-gradient(135deg, #007e81, #0e8898);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                margin-right: 15px;
                font-size: 18px;
                position: relative;
                z-index: 2;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .notification-content {
                flex: 1;
                position: relative;
                z-index: 2;
            }
            
            .notification-title {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 5px;
                color: white;
                text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .notification-message {
                font-size: 14px;
                line-height: 1.4;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            
            .close-notification {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: rgba(255,255,255,0.7);
                margin-left: 10px;
                transition: all 0.2s ease;
                line-height: 1;
                position: relative;
                z-index: 2;
            }
            
            .close-notification:hover {
                color: white;
                transform: scale(1.2);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .global-notification {
                    max-width: 280px;
                    right: 10px;
                    bottom: 10px;
                    padding: 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    generateStarShadows(n) {
        let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        for (let i = 2; i <= n; i++) {
            value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        }
        return value;
    }

    createContainers() {
        if (!document.getElementById('global-notification-container')) {
            const container = document.createElement('div');
            container.id = 'global-notification-container';
            document.body.appendChild(container);
        }
    }

    createStarElements() {
        // Create stars background container
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-bg';
        starsContainer.id = 'stars-container';
        
        // Create stars layers
        const stars = document.createElement('div');
        stars.id = 'stars';
        starsContainer.appendChild(stars);

        const stars2 = document.createElement('div');
        stars2.id = 'stars2';
        starsContainer.appendChild(stars2);

        const stars3 = document.createElement('div');
        stars3.id = 'stars3';
        starsContainer.appendChild(stars3);

        document.body.appendChild(starsContainer);
    }

    toggleStars(show) {
        const starsContainer = document.getElementById('stars-container');
        if (starsContainer) {
            if (show) {
                starsContainer.classList.add('active');
                this.starsVisible = true;
                setTimeout(() => {
                    if (this.starsVisible) {
                        starsContainer.classList.remove('active');
                        this.starsVisible = false;
                    }
                }, 60000); // Stars disappear after 60 seconds
            } else {
                starsContainer.classList.remove('active');
                this.starsVisible = false;
            }
        }
    }

    startChecking() {
        this.checkNotifications();
        setInterval(() => this.checkNotifications(), this.checkInterval);
    }

    loadNotifications() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === currentUser?.username);
            
            // Load medication reminders
            if (user?.medications) {
                this.notifications = user.medications.map(med => ({
                    id: `med-${med.name}-${med.time}`,
                    type: 'medication',
                    title: 'Medication Reminder',
                    message: `Time to take ${med.name}${med.dose ? ` (${med.dose})` : ''}`,
                    time: med.time,
                    photo: med.photo,
                    read: false
                }));
            }

            // Load appointment reminders
            const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            appointments.forEach(appt => {
                // Add reminder for 1 hour before appointment
                const [hours, minutes] = appt.time.split(':').map(Number);
                const reminderTime = new Date();
                reminderTime.setHours(hours - 1, minutes, 0, 0);
                const reminderTimeStr = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
                
                this.notifications.push({
                    id: `appt-${appt.date}-${appt.time}`,
                    type: 'appointment',
                    title: 'Upcoming Appointment',
                    message: `You have an appointment in 1 hour: ${appt.title || 'Appointment'} at ${appt.time}`,
                    time: reminderTimeStr,
                    date: appt.date,
                    read: false
                });

                // Add reminder for 15 minutes before appointment
                const reminderTime15 = new Date();
                reminderTime15.setHours(hours, minutes - 15, 0, 0);
                const reminderTime15Str = `${reminderTime15.getHours().toString().padStart(2, '0')}:${reminderTime15.getMinutes().toString().padStart(2, '0')}`;
                
                this.notifications.push({
                    id: `appt-15min-${appt.date}-${appt.time}`,
                    type: 'appointment',
                    title: 'Appointment Soon',
                    message: `Your appointment is in 15 minutes: ${appt.title || 'Appointment'} at ${appt.time}`,
                    time: reminderTime15Str,
                    date: appt.date,
                    read: false
                });
            });
        } catch (e) {
            console.error('Error loading notifications:', e);
        }
    }

    checkNotifications() {
        try {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            this.notifications.forEach(notification => {
                // For appointment notifications, also check the date matches
                const dateMatches = notification.type === 'medication' || 
                                  (notification.type === 'appointment' && notification.date === currentDate);
                
                if (notification.time === currentTime && !notification.read && dateMatches) {
                    this.showNotification(notification);
                    this.toggleStars(true);
                    notification.read = true;
                }
            });
        } catch (e) {
            console.error('Error checking notifications:', e);
        }
    }

    showNotification(notification) {
        try {
            // Activate stars background
            this.toggleStars(true);

            // Play sound based on notification type
            const sound = notification.type === 'medication' 
                ? this.sounds.reminder 
                : this.sounds.alert;
            
            sound.loop = true;
            sound.currentTime = 0; // Rewind to start
            sound.play().catch(e => console.log('Sound play failed:', e));

            // System notification
            if (Notification.permission === "granted") {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: notification.photo || "logo.png",
                    vibrate: [200, 100, 200]
                });
            }

            // In-page notification
            const photoElement = notification.photo 
                ? `<img src="${notification.photo}" class="notification-photo" alt="Notification">`
                : `<div class="notification-initials">${notification.title.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</div>`;

            const notificationElement = document.createElement('div');
            notificationElement.className = 'global-notification';
            notificationElement.dataset.notificationId = notification.id;
            notificationElement.innerHTML = `
                ${photoElement}
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
                <button class="close-notification" title="Close">&times;</button>
            `;

            const container = document.getElementById('global-notification-container');
            if (container) {
                container.appendChild(notificationElement);
                
                // Auto-remove after 60 seconds (1 minute)
                setTimeout(() => {
                    sound.pause();
                    sound.loop = false;
                    notificationElement.style.opacity = '0';
                    setTimeout(() => {
                        notificationElement.remove();
                    }, 300);
                }, 60000);
            }

            notificationElement.querySelector('.close-notification').addEventListener('click', () => {
                sound.pause();
                sound.loop = false;
                notificationElement.style.opacity = '0';
                setTimeout(() => {
                    notificationElement.remove();
                }, 300);
            });
        } catch (e) {
            console.error('Error showing notification:', e);
        }
    }

    requestPermission() {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }
}

// Initialize immediately and on DOM load
if (!window.globalNotifications) {
    window.globalNotifications = new GlobalNotifications();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.globalNotifications.init();
        });
    } else {
        window.globalNotifications.init();
    }
}