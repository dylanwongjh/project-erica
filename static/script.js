document.addEventListener('DOMContentLoaded', function() {
    // New Elements for Scenario Setup
    const scenarioScreen = document.getElementById('scenarioScreen');
    const chatInterface = document.getElementById('chatInterface');
    const scenarioInput = document.getElementById('scenarioInput'); 
    const beginChatButton = document.getElementById('beginChat');

    // Existing Chat Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const resourcesButton = document.getElementById('resourcesButton');
    const resourcesContent = document.getElementById('resourcesContent');
    const endSessionButton = document.getElementById('endSessionButton');
    
    let chatHistory = [];
    let currentScenario = ''; // Scenario tracking for debrief feature
    
    function smoothScrollToBottom() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    

    async function initChat(scenario) {
        showTyping();
        try {
            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Send the free-text scenario to prime ERICA
                body: JSON.stringify({ scenario: scenario })
            });
            
            const data = await response.json();
            hideTyping();
            document.getElementById('patientProfileBar').style.display = 'block';
            loadPatientProfile(); // Load patient profile after initialising the chat
            
            if (data.response) {
                addMessage(data.response, 'bot');
                chatHistory.push({
                    role: 'assistant',
                    content: data.response
                });
            } else if (data.error) {
                addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
            }
        } catch (error) {
            hideTyping();
            addMessage("Sorry, I'm experiencing technical difficulties. Please refresh the page.", 'bot');
            console.error('Error:', error);
        }
    }

    /* Added a Patient Profile feature */
    async function loadPatientProfile() {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            if (data.profile) renderProfile(data.profile);
        } catch (e) {
            console.error('[profile fetch error:', e);
        }
    }

    function renderProfile(p) {
        const content = document.getElementById('profileContent');

        const row = (label, value) => `
            <div class="profile-section">
                <div class="profile-label">${label}</div>
                <div class="profile-value">${value}</div>
            </div>`;

        const badges = (label, items, cls) => `
            <div class="profile-section">
                <div class="profile-label">${label}</div>
                <div class="badge-row">
                    ${items.map(i => `<span class="badge ${cls}">${i}</span>`).join(' ')}
                </div>
            </div>`;

        let html = '';
        if (p.scenario) html += row('Scenario', p.scenario);
        if (p.topic) html += row('Topic', p.topic);
        if (p.clinical_goal) html+= row('Clinical Goal', p.clinical_goal);
        if (p.primary_emotions?.length) html += badges('Primary emotions', p.primary_emotions, 'badge-emotion');
        if (p.cognitive_state?.length) html += badges('Cognitive state', p.cognitive_state, 'badge-cognitive');
        if (p.underlying_need) html += row('Underlying need', p.underlying_need);

        content.innerHTML = html || '<div class="profile-section"><div class="profile-value">No profile data found for this scenario.</div></div>';
    }

    document.getElementById('profileToggleBar').addEventListener('click', () => {
        const card = document.getElementById('profileCard');
        const chevron = document.getElementById('profileChevron');
        const isOpen = card.style.display === 'block';
        card.style.display = isOpen ? 'none' : 'block';
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        chatHistory.push({ role: 'user', content: message });
        userInput.value = '';
        showTyping();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_history: chatHistory })
            });
            
            const data = await response.json();
            hideTyping();
            
            if (data.response) {
                addMessage(data.response, 'bot');
                chatHistory.push({ role: 'assistant', content: data.response });
            }
        } catch (error) {
            hideTyping();
            addMessage("Connection error. Please try again.", 'bot');
        }
    }
    
    function addMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message', sender + '-message');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;
        
        messageContainer.appendChild(messageContent);
        chatMessages.appendChild(messageContainer);
        
        setTimeout(() => { smoothScrollToBottom(); }, 100);
    }
    
    function showTyping() {
        typingIndicator.style.display = 'flex';
        setTimeout(() => { smoothScrollToBottom(); }, 100);
    }
    
    function hideTyping() {
        typingIndicator.style.display = 'none';
    }
    
    const FRAMEWORKS = {
        spikes: [
            { letter: 'S', title: 'Setting', desc: 'Find a private space. Sit, make eye contact, minimise interruptions.' },
            { letter: 'P', title: 'Perception', desc: 'Ask what they know: "What have the doctors told you so far?"' },
            { letter: 'I', title: 'Invitation', desc: 'Ask how much detail they want before sharing information.' },
            { letter: 'K', title: 'Knowledge', desc: 'Share information in small chunks. Avoid jargon. Pause to check understanding.' },
            { letter: 'E', title: 'Emotions', desc: 'Acknowledge feelings with empathy. Don\'t rush past distress.' },
            { letter: 'S', title: 'Strategy & Summary', desc: 'Summarise discussion. Check for questions. Plan next steps.' },
        ],
        nurse: [
            { letter: 'N', title: 'Naming', desc: 'Name the emotion: "It sounds like you\'re feeling frightened."' },
            { letter: 'U', title: 'Understanding', desc: 'Acknowledge without assuming: "I can see this is really hard."' },
            { letter: 'R', title: 'Respecting', desc: 'Praise their strength: "You\'ve been managing so much."' },
            { letter: 'S', title: 'Supporting', desc: 'Express commitment: "I\'m going to be here with you through this."' },
            { letter: 'E', title: 'Exploring', desc: 'Invite more: "Can you tell me what worries you most?"'},
        ],
        sic: [
            { letter: '1', title: 'Ask for permission', desc: '"I\,d like to talk about what\'s ahead. Is this a good time?"' },
            { letter: '2', title: 'Assess understanding', desc: 'Explore what the patient knows and expects.' },
            { letter: '3', title: 'Share prognosis', desc: 'Be honest but compassionate.' },
            { letter: '4', title: 'Explore what matters', desc: '"What are your most important goals if time becomes short?"' },
            { letter: '5', title: 'Explore fears', desc: '"What are you most afraid of?"' }, 
            { letter: '6', title: 'Align care with values', desc: 'Summarise what you heard and connect it to the care plan.' },
        ]
    };

    let activeFramework = 'spikes';

    function renderFramework(key) {
        const steps = FRAMEWORKS[key];
        const frameworkContent = document.getElementById('frameworkContent');
        frameworkContent.innerHTML = steps.map(s =>
            `<div class="fw-step">
                <span class="fw-letter">${s.letter}</span>
                <div>
                    <div class="fw-step-title">${s.title}</div>
                    <div class="fw-step-desc">${s.desc}</div>
                </div>
            </div>`
        ).join('');
    }

    function toggleFrameworkPanel() {
        const panel = document.getElementById('frameworkPanel');
        const btn = document.getElementById('resourcesButton');
        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';
        btn.innerHTML = isVisible
            ? '<i class="fas fa-book-open"></i> Show Frameworks'
            : '<i class="fas fa-times"></i> Hide Frameworks';
        if (!isVisible) renderFramework(activeFramework);
    }

    resourcesButton.addEventListener('click', toggleFrameworkPanel);

    // Added tab switching
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fw-tab')) {
            document.querySelectorAll('.fw-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeFramework = e.target.dataset.fw;
            renderFramework(activeFramework);
        }
    });

    // --- EVENT LISTENERS ---

    // Transition logic: When user clicks "Begin"
    beginChatButton.addEventListener('click', function() {
        const scenario = scenarioInput.value.trim();
        
        if (scenario.length < 5) {
            alert("Please describe the situation briefly.");
            return;
        }

        // Hide the scenario input and show the chat
        document.getElementById('scenarioScreen').style.display = 'none';
        const chatUI = document.getElementById('chatInterface');
        chatUI.style.display = 'flex';

        currentScenario = scenario; // Save for debrief
        // Initialise the chat with the custom scenario (typing indicator signals loading)
        initChat(scenario);
    });

    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // End Session and Debrief
    let debriefData = null;
    let activeDebriefFw = 'SPIKES';

    endSessionButton.addEventListener('click', async function() {
        if (chatHistory.length < 2) {
            alert("The conversation is too short to evaluate. Please exchange at least a few messages first.");
            return;
        }

        // Show overlay in the loading state
        const overlay = document.getElementById('debriefOverlay');
        document.getElementById('debriefLoading').style.display = 'flex';
        document.getElementById('debriefResults').style.display = 'none';
        document.getElementById('debriefError').style.display = 'none';
        document.getElementById('debriefScenarioLabel').textContent = currentScenario;
        overlay.style.display = 'flex';

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_history: chatHistory, scenario: currentScenario })
            });
            const data = await response.json();

            document.getElementById('debriefLoading').style.display = 'none';

            if (data.evaluation) {
                debriefData = data.evaluation;
                renderDebrief(debriefData);
                document.getElementById('debriefResults').style.display = 'block';
            } else {
                document.getElementById('debriefError').style.display = 'block';
            }
        } catch (err) {
            document.getElementById('debriefLoading').style.display = 'none';
            document.getElementById('debriefError').style.display = 'block';
            console.error('[debrief error]:', err);
        }
    });

    function renderDebrief(ev) {
        // Overall Summary
        document.getElementById('debriefSummary').textContent = ev.overall_summary || '';

        // Dimensions
        const dimContainer = document.getElementById('debriefDimensions');
        dimContainer.innerHTML = '';
        (ev.dimensions || []).forEach(d => {
            const score = Math.max(1, Math.min(5, d.score));
            const pct = ((score - 1) / 4) * 100;
            // Colour shift according to the score
            const colour = score <= 2 ? '#C0714A' : score === 3 ? '#B8973A' : '#5A9E6F';
            dimContainer.innerHTML += `
                <div class="dim-row">
                    <div class="dim-header">
                        <span class="dim-name">${d.name}</span>
                        <span class="dim-score" style="color:${colour}">${score}<span class="dim-denom">/5</span></span>
                    </div>
                    <div class="dim-bar-track">
                        <div class="dim-bar-fill" style="width:${pct}%; background:${colour};"></div>
                    </div>
                    <p class="dim-justification">${d.justification}</p>
                </div>`;
        });

        // Checklist (render active tab)
        renderChecklistTab(activeDebriefFw);
    }

    function renderChecklistTab(fw) {
        if (!debriefData) return;
        const steps = debriefData.framework_checklist?.[fw] || [];
        const container = document.getElementById('debriefChecklist');
        container.innerHTML = steps.map(s => `
            <div class="checklist-row ${s.demonstrated ? 'demonstrated' : 'missed'}">
                <span class="checklist-icon">${s.demonstrated ? '✓' : '✗'}</span>
                <div class="checklist-text">
                    <span class="checklist-step">${s.step}</span>
                    <span class="checklist-note">${s.note}</span>
                </div>
            </div>`).join('');
    }

    // Debrief framework tab switching
    document.addEventListener('click', function(e) {
        if (e.target.dataset.debriefFw) {
            document.querySelectorAll('[data-debrief-fw]').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeDebriefFw = e.target.dataset.debriefFw;
            renderChecklistTab(activeDebriefFw);
        }
    });

    // New Session button resets everything
    document.getElementById('debriefNewSession').addEventListener('click', function() {
        document.getElementById('debriefOverlay').style.display = 'none';
        debriefData = null;
        activeDebriefFw = 'SPIKES';
        chatHistory = [];
        currentScenario = '';
        document.getElementById('chatMessages').innerHTML = '';
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('patientProfileBar').style.display = 'none';
        document.getElementById('profileCard').style.display = 'none';
        document.getElementById('scenarioInput').value = '';
        document.getElementById('scenarioScreen').style.display = 'flex';
        // Reset framework panel
        document.getElementById('frameworkPanel').style.display = 'none';
        document.getElementById('resourcesButton').innerHTML = '<i class="fas fa-book-open"></i> Show Frameworks';
    });
    

    // Note: initChat() is NO LONGER called here. 
    // It is called only after the user submits the scenario.
});
