class SCPFoundation {
    constructor() {
        this.scps = JSON.parse(localStorage.getItem('scps') || '[]');
        this.settings = JSON.parse(localStorage.getItem('settings') || '{}');
        this.breaches = JSON.parse(localStorage.getItem('breaches') || '[]');
        this.gois = JSON.parse(localStorage.getItem('gois') || '[]');
        this.esotericClasses = JSON.parse(localStorage.getItem('esotericClasses') || '[]');
        this.personnel = JSON.parse(localStorage.getItem('personnel') || '[]');
        this.clearanceLevels = JSON.parse(localStorage.getItem('clearanceLevels') || '[]');
        this.experiments = JSON.parse(localStorage.getItem('experiments') || '[]');
        this.projects = JSON.parse(localStorage.getItem('projects') || '[]');
        this.projectSCPs = JSON.parse(localStorage.getItem('projectSCPs') || '[]');
        this.requests = JSON.parse(localStorage.getItem('requests') || '[]');
        this.isBreachActive = false;
        this.isInvasionActive = false;
        this.breachCheckInterval = null;
        this.invasionCheckInterval = null;
        this.requestCheckInterval = null;
        this.currentTheme = localStorage.getItem('siteTheme') || 'normal';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.loadTheme();
        this.updateStats();
        this.displayRecentSCPs();
        this.displayArchive();
        this.displayMTFs();
        this.displayGOIs();
        this.displayEsotericClasses();
        this.displayProjects();
        this.populateProjectSelects();
        this.populateProjectPersonnel();
        this.startBreachSimulation();
        this.startInvasionSimulation();
        this.startRequestSimulation();
    }

    loadTheme() {
        const theme = this.currentTheme;
        document.body.className = `theme-${theme}`;
        
        // Update the select element to show current theme
        const select = document.getElementById('siteStyleSelect');
        if (select) {
            select.value = theme;
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigate(e.target.dataset.page));
        });

        // Forms
        document.getElementById('scpForm').addEventListener('submit', (e) => this.createSCP(e));
        document.getElementById('mtfForm').addEventListener('submit', (e) => this.createMTF(e));
        document.getElementById('goiForm').addEventListener('submit', (e) => this.createGOI(e));
        document.getElementById('personnelForm').addEventListener('submit', (e) => this.createPersonnel(e));
        document.getElementById('clearanceForm').addEventListener('submit', (e) => this.createClearanceLevel(e));
        document.getElementById('experimentForm').addEventListener('submit', (e) => this.createExperiment(e));
        document.getElementById('settingsForm').addEventListener('submit', (e) => this.saveSettings(e));
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
        
        // Quick MTF create on Enter key
        document.getElementById('existingMTFName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.quickCreateMTF();
            }
        });
        
        // Filters
        document.getElementById('departmentFilter').addEventListener('change', () => this.filterPersonnel());
        document.getElementById('clearanceFilter').addEventListener('change', () => this.filterPersonnel());
        
        // Breach/Invasion actions
        document.getElementById('deployBtn').addEventListener('click', () => {
            const breachId = this.breaches.find(b => b.status === 'ACTIVE')?.id;
            if (breachId) this.deployMTF(breachId);
        });
        document.getElementById('ignoreBtn').addEventListener('click', () => {
            const breach = this.breaches.find(b => b.status === 'ACTIVE');
            if (breach) this.ignoreBreach(breach);
        });
        document.getElementById('defendBtn').addEventListener('click', () => {
            const invasionId = this.gois.find(g => g.name === document.getElementById('invadingGOI').textContent)?.id;
            if (invasionId) this.defendAgainstInvasion(invasionId);
        });
        document.getElementById('surrenderBtn').addEventListener('click', () => {
            const invasion = { goiName: document.getElementById('invadingGOI').textContent };
            this.surrenderSCP(invasion);
        });
        
        // Esoteric Classes
        document.getElementById('esotericClassForm').addEventListener('submit', (e) => this.createEsotericClass(e));
        
        // Quick contain on Enter key
        document.getElementById('existingSCPNumber').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.containExistingSCP();
            }
        });
        
        // Update SCP class dropdown when creating new SCP
        const scpClassSelect = document.getElementById('scpClass');
        if (scpClassSelect) {
            this.populateSCPClasses();
        }
        
        // Projects
        document.getElementById('projectForm').addEventListener('submit', (e) => this.createProject(e));
        document.getElementById('aiSCPForm').addEventListener('submit', (e) => this.generateAISCP(e));
        
        // Site Style form
        document.getElementById('siteStyleForm').addEventListener('submit', (e) => this.changeSiteStyle(e));
    }

    navigate(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(page).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
    }

    createSCP(e) {
        e.preventDefault();
        
        const scp = {
            id: Date.now(),
            number: document.getElementById('scpNumber').value,
            name: document.getElementById('scpName').value,
            class: document.getElementById('scpClass').value,
            containment: document.getElementById('scpDescription').value,
            description: document.getElementById('scpDescription2').value,
            image: document.getElementById('scpImage').value,
            created: new Date().toISOString()
        };

        this.scps.unshift(scp);
        localStorage.setItem('scps', JSON.stringify(this.scps));
        
        e.target.reset();
        this.updateStats();
        this.displayRecentSCPs();
        this.displayArchive();
        
        alert('SCP created successfully!');
    }

    createMTF(e) {
        e.preventDefault();
        
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const mtf = {
            id: Date.now(),
            designation: document.getElementById('mtfDesignation').value,
            codename: document.getElementById('mtfCodename').value,
            mission: document.getElementById('mtfMission').value,
            specialization: document.getElementById('mtfSpecialization').value,
            status: document.getElementById('mtfStatus').value,
            created: new Date().toISOString()
        };

        mtfs.unshift(mtf);
        localStorage.setItem('mtfs', JSON.stringify(mtfs));
        
        e.target.reset();
        this.displayMTFs();
        
        alert('MTF created successfully!');
    }

    createGOI(e) {
        e.preventDefault();
        
        const gois = JSON.parse(localStorage.getItem('gois') || '[]');
        const goi = {
            id: Date.now(),
            name: document.getElementById('goiName').value,
            codename: document.getElementById('goiCodename').value,
            threatLevel: document.getElementById('goiThreatLevel').value,
            description: document.getElementById('goiDescription').value,
            specialization: document.getElementById('goiSpecialization').value,
            created: new Date().toISOString()
        };

        gois.unshift(goi);
        localStorage.setItem('gois', JSON.stringify(gois));
        
        e.target.reset();
        this.displayGOIs();
        
        alert('Group of Interest created successfully!');
    }

    createPersonnel(e) {
        e.preventDefault();
        
        const personnel = {
            id: Date.now(),
            name: document.getElementById('personnelName').value,
            role: document.getElementById('personnelRole').value,
            clearance: document.getElementById('personnelClearance').value,
            department: document.getElementById('personnelDepartment').value,
            status: document.getElementById('personnelStatus').value,
            created: new Date().toISOString()
        };

        this.personnel.unshift(personnel);
        localStorage.setItem('personnel', JSON.stringify(this.personnel));
        
        e.target.reset();
        this.displayPersonnel();
        this.populateExperimentPersonnel();
        
        alert('Personnel added successfully!');
    }

    createClearanceLevel(e) {
        e.preventDefault();
        
        const clearance = {
            id: Date.now(),
            name: document.getElementById('clearanceName').value,
            level: parseInt(document.getElementById('clearanceLevel').value),
            description: document.getElementById('clearanceDescription').value,
            created: new Date().toISOString()
        };

        this.clearanceLevels.unshift(clearance);
        localStorage.setItem('clearanceLevels', JSON.stringify(this.clearanceLevels));
        
        e.target.reset();
        this.displayClearanceLevels();
        this.populatePersonnelClearances();
        
        alert('Clearance level created successfully!');
    }

    createExperiment(e) {
        e.preventDefault();
        
        const experiment = {
            id: Date.now(),
            name: document.getElementById('experimentName').value,
            scpId: document.getElementById('experimentSCP').value,
            scpNumber: document.getElementById('experimentSCP').selectedOptions[0]?.text.split(' - ')[0] || 'Unknown',
            leadId: document.getElementById('experimentLead').value,
            leadName: document.getElementById('experimentLead').selectedOptions[0]?.text || 'Unknown',
            type: document.getElementById('experimentType').value,
            status: document.getElementById('experimentStatus').value,
            description: document.getElementById('experimentDescription').value,
            startDate: new Date().toISOString(),
            created: new Date().toISOString()
        };

        this.experiments.unshift(experiment);
        localStorage.setItem('experiments', JSON.stringify(this.experiments));
        
        e.target.reset();
        this.displayExperiments();
        
        alert('Experiment created successfully!');
    }

    async generateAISCP(e) {
        e.preventDefault();
        
        const projectId = document.getElementById('aiProjectSelect').value;
        const prompt = document.getElementById('aiPrompt').value;
        const preferredClass = document.getElementById('aiSCPClass').value;
        
        if (!projectId) {
            alert('Please select a project first!');
            return;
        }

        const loading = document.getElementById('aiLoading');
        loading.style.display = 'block';
        document.getElementById('aiSCPForm').style.display = 'none';

        try {
            // Generate SCP using AI
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an SCP Foundation database. Generate a complete SCP entry based on the user's prompt. Include:
- SCP number (use the next available number)
- Object class (Safe/Euclid/Keter/Thaumiel)
- Special containment procedures
- Description of the anomaly
- Make it creative and unique
Format as JSON with fields: number, name, class, containment, description`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                json: true
            });

            const scpData = JSON.parse(completion.content);
            
            // Override class if user specified
            if (preferredClass) {
                scpData.class = preferredClass;
            }

            // Create the SCP
            const scp = {
                id: Date.now(),
                ...scpData,
                projectId: projectId,
                isAIGenerated: true,
                created: new Date().toISOString()
            };

            this.projectSCPs.unshift(scp);
            localStorage.setItem('projectSCPs', JSON.stringify(this.projectSCPs));
            
            // Reset form
            e.target.reset();
            
            alert(`✅ SUCCESS! AI-generated SCP-${scp.number} has been created and added to your project!`);
            
            // Refresh displays
            this.displayProjectSCPs(projectId);
            this.displayProjects();

        } catch (error) {
            console.error('Error generating SCP:', error);
            alert('❌ Error generating SCP. Please try again with a different prompt.');
        } finally {
            loading.style.display = 'none';
            document.getElementById('aiSCPForm').style.display = 'block';
        }
    }

    createProject(e) {
        e.preventDefault();
        
        const project = {
            id: Date.now(),
            name: document.getElementById('projectName').value,
            code: document.getElementById('projectCode').value,
            type: document.getElementById('projectType').value,
            leadId: document.getElementById('projectLead').value,
            leadName: document.getElementById('projectLead').selectedOptions[0]?.text || 'Unknown',
            description: document.getElementById('projectDescription').value,
            status: document.getElementById('projectStatus').value,
            created: new Date().toISOString(),
            scpCount: 0
        };

        this.projects.unshift(project);
        localStorage.setItem('projects', JSON.stringify(this.projects));
        
        e.target.reset();
        this.displayProjects();
        this.populateProjectSelects();
        this.populateProjectPersonnel();
        
        alert('Project created successfully!');
    }

    displayRecentSCPs() {
        const container = document.getElementById('recentList');
        const recent = this.scps.slice(0, 3);
        
        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">No SCPs created yet. Start by creating your first SCP!</p>';
            return;
        }

        container.innerHTML = recent.map(scp => this.createSCPCard(scp)).join('');
        
        // Populate experiment SCPs
        this.populateExperimentSCPs();
    }

    displayArchive() {
        const container = document.getElementById('archiveList');
        
        if (this.scps.length === 0) {
            container.innerHTML = '<p class="empty-state">No SCPs in archive</p>';
            return;
        }

        container.innerHTML = this.scps.map(scp => this.createSCPCard(scp)).join('');
    }

    displayMTFs() {
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const container = document.getElementById('mtfList');
        
        if (mtfs.length === 0) {
            container.innerHTML = '<p class="empty-state">No MTFs created yet. Create your first Mobile Task Force!</p>';
            return;
        }

        container.innerHTML = mtfs.map(mtf => this.createMTFCard(mtf)).join('');
    }

    createMTFCard(mtf) {
        return `
            <div class="mtf-card">
                <div class="mtf-header">
                    <h4>${mtf.designation}</h4>
                    <span class="status-badge class-${mtf.status}">${mtf.status}</span>
                </div>
                <p>${mtf.mission.substring(0, 100)}...</p>
                <div class="mtf-actions">
                    <button onclick="app.editMTF(${mtf.id})" class="btn-small">Edit</button>
                    <button onclick="app.deleteMTF(${mtf.id})" class="btn-small btn-danger">Delete</button>
                </div>
            </div>
        `;
    }

    editMTF(id) {
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const mtfIndex = mtfs.findIndex(m => m.id === id);
        
        if (mtfIndex === -1) return;
        
        const mtf = mtfs[mtfIndex];
        
        // Fill form with existing data
        document.getElementById('mtfDesignation').value = mtf.designation;
        document.getElementById('mtfCodename').value = mtf.codename;
        document.getElementById('mtfMission').value = mtf.mission;
        document.getElementById('mtfSpecialization').value = mtf.specialization;
        document.getElementById('mtfStatus').value = mtf.status;
        
        // Change form to edit mode
        const form = document.getElementById('mtfForm');
        form.dataset.editing = id;
        
        // Change submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update MTF';
        
        // Navigate to MTF page
        this.navigate('mtf');
        
        alert(`Editing ${mtf.designation}. Make your changes and click "Update MTF".`);
    }

    deleteMTF(id) {
        if (!confirm('Are you sure you want to delete this MTF? This action cannot be undone.')) return;
        
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const mtfIndex = mtfs.findIndex(m => m.id === id);
        
        if (mtfIndex === -1) return;
        
        const deletedMTF = mtfs[mtfIndex];
        mtfs.splice(mtfIndex, 1);
        localStorage.setItem('mtfs', JSON.stringify(mtfs));
        
        this.displayMTFs();
        
        alert(`${deletedMTF.designation} has been deleted.`);
    }

    displayGOIs() {
        const gois = JSON.parse(localStorage.getItem('gois') || '[]');
        const container = document.getElementById('goiList');
        
        if (gois.length === 0) {
            container.innerHTML = '<p class="empty-state">No GOIs created yet. Create your first Group of Interest!</p>';
            return;
        }

        container.innerHTML = gois.map(goi => this.createGOICard(goi)).join('');
    }

    displayEsotericClasses() {
        const container = document.getElementById('esotericClassesList');
        
        if (this.esotericClasses.length === 0) {
            container.innerHTML = '<p class="empty-state">No custom classes created yet</p>';
            return;
        }

        container.innerHTML = this.esotericClasses.map(cls => `
            <div class="esoteric-class-item">
                <div class="esoteric-class-name esoteric-${cls.color}">${cls.name}</div>
                <div class="esoteric-class-desc">${cls.description}</div>
                <div class="esoteric-class-color esoteric-${cls.color}">${cls.color}</div>
            </div>
        `).join('');
    }

    displayProjects() {
        const container = document.getElementById('projectsList');
        
        if (this.projects.length === 0) {
            container.innerHTML = '<p class="empty-state">No projects created yet. Create your first project!</p>';
            return;
        }

        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
    }

    displayProjectSCPs(projectId) {
        const container = document.getElementById('projectSCPsList');
        const projectSCPs = this.projectSCPs.filter(scp => scp.projectId == projectId);
        
        if (projectSCPs.length === 0) {
            container.innerHTML = '<p class="empty-state">No SCPs in this project yet</p>';
            return;
        }

        container.innerHTML = projectSCPs.map(scp => this.createProjectSCPCard(scp)).join('');
    }

    populateSCPClasses() {
        const select = document.getElementById('scpClass');
        if (!select) return;
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add standard classes
        const standardClasses = ['Safe', 'Euclid', 'Keter', 'Thaumiel', 'Neutralized'];
        standardClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = cls;
            select.appendChild(option);
        });
        
        // Add custom esoteric classes
        this.esotericClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.name;
            option.textContent = cls.name;
            option.style.color = this.getClassColor(cls.color);
            select.appendChild(option);
        });
    }

    getClassColor(colorName) {
        const colors = {
            red: '#F44336',
            blue: '#2196F3',
            purple: '#9C27B0',
            orange: '#FF9800',
            cyan: '#00BCD4',
            pink: '#E91E63',
            yellow: '#FFEB3B',
            green: '#4CAF50'
        };
        return colors[colorName] || '#00FF41';
    }

    createSCPCard(scp) {
        const classColor = this.esotericClasses.find(c => c.name === scp.class)?.color || '';
        return `
            <div class="scp-card" onclick="app.viewSCP(${scp.id})">
                <h4>SCP-${scp.number}: ${scp.name}</h4>
                <span class="class-badge esoteric-${classColor}">${scp.class}</span>
                <p>${scp.description.substring(0, 100)}...</p>
            </div>
        `;
    }

    viewSCP(id) {
        const scp = this.scps.find(s => s.id === id);
        if (!scp) return;

        alert(`SCP-${scp.number}: ${scp.name}\n\nClass: ${scp.class}\n\nContainment: ${scp.containment}\n\nDescription: ${scp.description}`);
    }

    viewMTF(id) {
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const mtf = mtfs.find(m => m.id === id);
        if (!mtf) return;

        alert(`${mtf.designation}: ${mtf.codename}\n\nStatus: ${mtf.status}\nSpecialization: ${mtf.specialization}\n\nMission: ${mtf.mission}`);
    }

    viewGOI(id) {
        const gois = JSON.parse(localStorage.getItem('gois') || '[]');
        const goi = gois.find(g => g.id === id);
        if (!goi) return;

        alert(`${goi.name} (${goi.codename})\n\nThreat Level: ${goi.threatLevel}\nSpecialization: ${goi.specialization}\n\n${goi.description}`);
    }

    filterSCPs() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const classFilter = document.getElementById('classFilter').value;
        
        const filtered = this.scps.filter(scp => {
            const matchesSearch = scp.name.toLowerCase().includes(search) || 
                                scp.number.toLowerCase().includes(search);
            const matchesClass = !classFilter || scp.class === classFilter;
            
            return matchesSearch && matchesClass;
        });

        const container = document.getElementById('archiveList');
        container.innerHTML = filtered.length ? 
            filtered.map(scp => this.createSCPCard(scp)).join('') : 
            '<p class="empty-state">No SCPs match your criteria</p>';
    }

    updateStats() {
        document.getElementById('scpCount').textContent = this.scps.length;
        
        const created = this.settings.created ? new Date(this.settings.created) : new Date();
        const now = new Date();
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        document.getElementById('foundationAge').textContent = days;
    }

    loadSettings() {
        if (this.settings.name) {
            document.getElementById('foundationName').textContent = this.settings.name.toUpperCase();
            document.getElementById('foundationNameInput').value = this.settings.name;
        }
        if (this.settings.motto) {
            document.querySelector('.motto').textContent = this.settings.motto;
            document.getElementById('foundationMotto').value = this.settings.motto;
        }
    }

    saveSettings(e) {
        e.preventDefault();
        
        this.settings = {
            name: document.getElementById('foundationNameInput').value || 'SCP Foundation',
            motto: document.getElementById('foundationMotto').value || 'Secure. Contain. Protect.',
            created: this.settings.created || new Date().toISOString()
        };
        
        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.loadSettings();
        
        alert('Settings saved!');
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            localStorage.removeItem('scps');
            localStorage.removeItem('mtfs');
            localStorage.removeItem('gois');
            localStorage.removeItem('settings');
            this.scps = [];
            this.settings = {};
            location.reload();
        }
    }

    ignoreBreach(breach) {
        this.failBreach(breach);
        document.getElementById('breachModal').style.display = 'none';
    }

    surrenderSCP(invasion) {
        this.failInvasion(invasion);
        document.getElementById('invasionModal').style.display = 'none';
    }

    createGOICard(goi) {
        return `
            <div class="goi-card" onclick="app.viewGOI(${goi.id})">
                <h4>${goi.name}</h4>
                <span class="threat-badge class-${goi.threatLevel}">${goi.threatLevel} Threat</span>
                <p>${goi.description.substring(0, 100)}...</p>
                <small>Focus: ${goi.specialization}</small>
            </div>
        `;
    }

    displayPersonnel() {
        const container = document.getElementById('personnelList');
        const departmentFilter = document.getElementById('departmentFilter').value;
        const clearanceFilter = document.getElementById('clearanceFilter').value;
        
        let filtered = this.personnel;
        if (departmentFilter) {
            filtered = filtered.filter(p => p.department === departmentFilter);
        }
        if (clearanceFilter) {
            filtered = filtered.filter(p => p.clearance === clearanceFilter);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No personnel match your criteria</p>';
            return;
        }

        container.innerHTML = filtered.map(personnel => this.createPersonnelCard(personnel)).join('');
    }

    displayClearanceLevels() {
        const container = document.getElementById('clearanceList');
        
        if (this.clearanceLevels.length === 0) {
            container.innerHTML = '<p class="empty-state">No custom clearance levels created</p>';
            return;
        }

        container.innerHTML = this.clearanceLevels.map(clearance => `
            <div class="clearance-item">
                <div class="clearance-name">${clearance.name}</div>
                <div class="clearance-level">Level ${clearance.level}</div>
                <div class="clearance-description">${clearance.description}</div>
            </div>
        `).join('');
    }

    displayExperiments() {
        const container = document.getElementById('experimentList');
        
        if (this.experiments.length === 0) {
            container.innerHTML = '<p class="empty-state">No experiments scheduled</p>';
            return;
        }

        container.innerHTML = this.experiments.map(experiment => this.createExperimentCard(experiment)).join('');
    }

    populatePersonnelClearances() {
        const select = document.getElementById('personnelClearance');
        const filterSelect = document.getElementById('clearanceFilter');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        while (filterSelect.children.length > 1) {
            filterSelect.removeChild(filterSelect.lastChild);
        }
        
        // Add default clearance levels
        const defaultClearances = ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
        defaultClearances.forEach(clearance => {
            const option = document.createElement('option');
            option.value = clearance;
            option.textContent = clearance;
            select.appendChild(option);
            
            const filterOption = document.createElement('option');
            filterOption.value = clearance;
            filterOption.textContent = clearance;
            filterSelect.appendChild(filterOption);
        });
        
        // Add custom clearance levels
        this.clearanceLevels.forEach(clearance => {
            const option = document.createElement('option');
            option.value = clearance.name;
            option.textContent = clearance.name;
            select.appendChild(option);
            
            const filterOption = document.createElement('option');
            filterOption.value = clearance.name;
            filterOption.textContent = clearance.name;
            filterSelect.appendChild(filterOption);
        });
    }

    populateExperimentPersonnel() {
        const select = document.getElementById('experimentLead');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add active personnel
        const activePersonnel = this.personnel.filter(p => p.status === 'Active');
        activePersonnel.forEach(personnel => {
            const option = document.createElement('option');
            option.value = personnel.id;
            option.textContent = `${personnel.name} (${personnel.role})`;
            select.appendChild(option);
        });
    }

    populateExperimentSCPs() {
        const select = document.getElementById('experimentSCP');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add SCPs
        this.scps.forEach(scp => {
            const option = document.createElement('option');
            option.value = scp.id;
            option.textContent = `SCP-${scp.number} - ${scp.name}`;
            select.appendChild(option);
        });
    }

    createPersonnelCard(personnel) {
        return `
            <div class="personnel-card" onclick="app.viewPersonnel(${personnel.id})">
                <h4>${personnel.name}</h4>
                <div class="personnel-role">${personnel.role}</div>
                <span class="personnel-clearance">${personnel.clearance}</span>
                <div class="personnel-department">${personnel.department}</div>
                <span class="personnel-status status-${personnel.status}">${personnel.status}</span>
            </div>
        `;
    }

    createExperimentCard(experiment) {
        return `
            <div class="experiment-card" onclick="app.viewExperiment(${experiment.id})">
                <div class="experiment-title">${experiment.name}</div>
                <span class="experiment-type">${experiment.type}</span>
                <span class="experiment-status status-${experiment.status}">${experiment.status}</span>
                <div class="experiment-description">${experiment.description.substring(0, 100)}...</div>
                <div class="experiment-lead">Lead: ${experiment.leadName}</div>
            </div>
        `;
    }

    filterPersonnel() {
        this.displayPersonnel();
    }

    viewPersonnel(id) {
        const personnel = this.personnel.find(p => p.id === id);
        if (!personnel) return;

        alert(`${personnel.name}\n\nRole: ${personnel.role}\nClearance: ${personnel.clearance}\nDepartment: ${personnel.department}\nStatus: ${personnel.status}\n\nAdded: ${new Date(personnel.created).toLocaleString()}`);
    }

    viewExperiment(id) {
        const experiment = this.experiments.find(e => e.id === id);
        if (!experiment) return;

        alert(`${experiment.name}\n\nSCP: ${experiment.scpNumber}\nType: ${experiment.type}\nStatus: ${experiment.status}\nLead: ${experiment.leadName}\n\n${experiment.description}`);
    }

    containExistingSCP() {
        const scpNumber = document.getElementById('existingSCPNumber').value.trim();
        
        if (!scpNumber) {
            alert('Please enter an SCP number');
            return;
        }

        // Check if already contained
        const alreadyContained = this.scps.find(s => s.number === scpNumber);
        if (alreadyContained) {
            alert(`SCP-${scpNumber} is already contained in your foundation!`);
            return;
        }

        // Pre-defined data for well-known SCPs
        const existingSCPs = {
            '173': {
                name: 'The Sculpture',
                class: 'Euclid',
                containment: 'SCP-173 is to be kept in a locked container at all times. When personnel must enter SCP-173\'s container, no fewer than 3 personnel may enter at any time and the door is to be relocked behind them.',
                description: 'SCP-173 is constructed from concrete and rebar with traces of Krylon brand spray paint. SCP-173 is animate and extremely hostile.'
            },
            '682': {
                name: 'Hard-to-Destroy Reptile',
                class: 'Keter',
                containment: 'SCP-682 must be destroyed as soon as possible. At this time, no means available to SCP teams are capable of destroying SCP-682.',
                description: 'SCP-682 is a large, vaguely reptile-like creature of unknown origin. It appears to be extremely intelligent.'
            },
            '999': {
                name: 'The Tickle Monster',
                class: 'Safe',
                containment: 'SCP-999 is allowed to freely roam the facility should it desire to, but otherwise must stay in its pen either between 8PM-9PM for sleeping, or when staff request.',
                description: 'SCP-999 appears to be a large, amorphous, gelatinous mass of translucent orange slime, weighing about 120 lbs (54.4kg).'
            },
            '096': {
                name: 'The Shy Guy',
                class: 'Euclid',
                containment: 'SCP-096 is to be contained in its cell, a 5m x 5m x 5m airtight steel cube, at all times.',
                description: 'SCP-096 is a humanoid creature measuring approximately 2.38 meters in height. Subject shows very little muscle mass.'
            },
            '049': {
                name: 'The Plague Doctor',
                class: 'Euclid',
                containment: 'SCP-049 is contained within a Standard Secure Humanoid Containment Cell in Research Sector-██.',
                description: 'SCP-049 is a humanoid entity, roughly 1.9 meters in height, which bears the appearance of a medieval plague doctor.'
            },
            '106': {
                name: 'The Old Man',
                class: 'Keter',
                containment: 'SCP-106 is to be contained in a sealed container, comprised of lead-lined steel. The container is to be kept suspended within a second container.',
                description: 'SCP-106 appears to be an elderly humanoid, with a general appearance of advanced decomposition.'
            },
            '001': {
                name: 'The Gate Guardian',
                class: 'Thaumiel',
                containment: 'SCP-001 is to be monitored at all times for any changes in position or behavior.',
                description: 'SCP-001 is a massive humanoid figure approximately 700 cubits in height, located in an undisclosed location near the intersection of the Tigris and Euphrates rivers.'
            },
            '500': {
                name: 'Panacea',
                class: 'Safe',
                containment: 'SCP-500 consists of SCP-500-█ through SCP-500-██. SCP-500-█ through SCP-500-██ are to be contained in a secure medical storage unit.',
                description: 'SCP-500 is a small plastic canister which holds forty-seven (47) pills. The words "Dr. G.W., take two daily" are handwritten on the lid.'
            },
            '914': {
                name: 'The Clockworks',
                class: 'Safe',
                containment: 'SCP-914 is to be kept in Research Sector-██, with two (2) Level 2 security personnel stationed at its door.',
                description: 'SCP-914 is a large clockwork device weighing several tons. When an object is placed in the input booth, a door slides shut, and a small bell sounds.'
            },
            '079': {
                name: 'Old AI',
                class: 'Euclid',
                containment: 'SCP-079 is contained within an altered, triple-wide, standard Foundation storage unit, designated as SCP-079-1.',
                description: 'SCP-079 is an Exidy Sorcerer microcomputer built in 1978. Its creator, █████ ██████ (deceased), was a college sophomore.'
            }
        };

        const scpData = existingSCPs[scpNumber];
        
        if (scpData) {
            // Create SCP from existing data
            const scp = {
                id: Date.now(),
                number: scpNumber,
                name: scpData.name,
                class: scpData.class,
                containment: scpData.containment,
                description: scpData.description,
                created: new Date().toISOString()
            };

            this.scps.unshift(scp);
            localStorage.setItem('scps', JSON.stringify(this.scps));
            
            // Clear input
            document.getElementById('existingSCPNumber').value = '';
            
            // Update displays
            this.updateStats();
            this.displayRecentSCPs();
            this.displayArchive();
            
            alert(`✅ SUCCESS! SCP-${scpNumber} has been successfully contained in your foundation!`);
        } else {
            // For unknown SCPs, create a basic template
            const scp = {
                id: Date.now(),
                number: scpNumber,
                name: `Unknown SCP-${scpNumber}`,
                class: 'Euclid',
                containment: 'Standard containment procedures apply. SCP must be monitored at all times.',
                description: `SCP-${scpNumber} is an anomalous entity/object that requires further study and documentation.`,
                created: new Date().toISOString()
            };

            this.scps.unshift(scp);
            localStorage.setItem('scps', JSON.stringify(this.scps));
            
            // Clear input
            document.getElementById('existingSCPNumber').value = '';
            
            // Update displays
            this.updateStats();
            this.displayRecentSCPs();
            this.displayArchive();
            
            alert(`⚠️ SCP-${scpNumber} has been contained with basic information. You may want to edit its details later.`);
        }
    }

    quickCreateMTF() {
        const mtfName = document.getElementById('existingMTFName').value.trim();
        
        if (!mtfName) {
            alert('Please enter an MTF designation');
            return;
        }

        // Pre-defined data for well-known MTFs
        const existingMTFs = {
            'Alpha-1': {
                codename: 'Red Right Hand',
                mission: 'Internal security and protection of O5 Council members. Handles the most sensitive Foundation operations.',
                specialization: 'Internal Security, VIP Protection'
            },
            'Epsilon-11': {
                codename: 'Nine-Tailed Fox',
                mission: 'Handles internal security breaches and SCP recovery operations within Foundation facilities.',
                specialization: 'Internal Security, SCP Recovery'
            },
            'Nu-7': {
                codename: 'Hammer Down',
                mission: 'Heavy combat operations and large-scale containment breaches. Military-grade response team.',
                specialization: 'Heavy Combat, Military Operations'
            },
            'Beta-7': {
                codename: 'Maz Hatters',
                mission: 'Specializes in handling biological, chemical, and radiological hazards. First response to contamination events.',
                specialization: 'Hazmat, CBRN Operations'
            },
            'Gamma-5': {
                codename: 'Red Herrings',
                mission: 'Information suppression and disinformation campaigns. Maintains secrecy of Foundation operations.',
                specialization: 'Information Control, Disinformation'
            },
            'Delta-5': {
                codename: 'Front Runners',
                mission: 'Investigates and secures anomalous objects before rival organizations can obtain them.',
                specialization: 'Object Recovery, Rival Interdiction'
            },
            'Zeta-9': {
                codename: 'Mole Rats',
                mission: 'Specializes in navigating underground and enclosed spaces. Handles subterranean anomalies.',
                specialization: 'Underground Operations, Cave Exploration'
            },
            'Eta-10': {
                codename: 'See No Evil',
                mission: 'Handles cognitohazards and infohazards. Specializes in containing anomalies that affect perception.',
                specialization: 'Cognitohazard, Infohazard Containment'
            },
            'Theta-7': {
                codename: 'Helios',
                mission: 'Handles anomalous energy sources and radiation-based SCPs. Nuclear and energy specialists.',
                specialization: 'Energy Anomalies, Radiation Control'
            },
            'Iota-10': {
                codename: 'Damn Feds',
                mission: 'Liaises with government agencies and law enforcement. Maintains Foundation-government relations.',
                specialization: 'Government Relations, Legal Affairs'
            }
        };

        const mtfData = existingMTFs[mtfName];
        
        if (mtfData) {
            // Create MTF from existing data
            const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
            const mtf = {
                id: Date.now(),
                designation: `MTF ${mtfName}`,
                codename: mtfData.codename,
                mission: mtfData.mission,
                specialization: mtfData.specialization,
                status: 'Active',
                created: new Date().toISOString()
            };

            mtfs.unshift(mtf);
            localStorage.setItem('mtfs', JSON.stringify(mtfs));
            
            // Clear input
            document.getElementById('existingMTFName').value = '';
            
            // Update display
            this.displayMTFs();
            
            alert(`✅ SUCCESS! ${mtf.designation} (${mtf.codename}) has been created!`);
        } else {
            // For unknown MTFs, create a basic template
            const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
            const mtf = {
                id: Date.now(),
                designation: `MTF ${mtfName}`,
                codename: 'Unknown Designation',
                mission: 'Standard Mobile Task Force operations including SCP recovery, containment, and facility security.',
                specialization: 'General Operations',
                status: 'Active',
                created: new Date().toISOString()
            };

            mtfs.unshift(mtf);
            localStorage.setItem('mtfs', JSON.stringify(mtfs));
            
            // Clear input
            document.getElementById('existingMTFName').value = '';
            
            // Update display
            this.displayMTFs();
            
            alert(`⚠️ ${mtf.designation} has been created with basic information. You may want to edit its details later.`);
        }
    }

    createProjectCard(project) {
        const projectSCPs = this.projectSCPs.filter(scp => scp.projectId == project.id);
        const scpCount = projectSCPs.length;
        
        return `
            <div class="project-card" onclick="app.viewProject(${project.id})">
                <div class="project-header">
                    <h4>${project.name}</h4>
                    <span class="project-code">${project.code}</span>
                </div>
                <div class="project-type">${project.type}</div>
                <div class="project-lead">Lead: ${project.leadName}</div>
                <div class="project-stats">
                    <span class="scp-count">${scpCount} SCPs</span>
                    <span class="project-status status-${project.status}">${project.status}</span>
                </div>
                <p class="project-description">${project.description.substring(0, 100)}...</p>
                <div class="project-actions">
                    <button onclick="event.stopPropagation(); app.displayProjectSCPs(${project.id})" class="btn-small">View SCPs</button>
                </div>
            </div>
        `;
    }

    createProjectSCPCard(scp) {
        return `
            <div class="scp-card" onclick="app.viewProjectSCP(${scp.id})">
                <h4>SCP-${scp.number}: ${scp.name}</h4>
                <span class="class-badge class-${scp.class}">${scp.class}</span>
                ${scp.isAIGenerated ? '<span class="ai-badge">🤖 AI Generated</span>' : ''}
                <p>${scp.description.substring(0, 100)}...</p>
            </div>
        `;
    }

    populateProjectSelects() {
        const aiSelect = document.getElementById('aiProjectSelect');
        
        // Clear existing options except the first one
        while (aiSelect.children.length > 1) {
            aiSelect.removeChild(aiSelect.lastChild);
        }
        
        // Add active projects
        const activeProjects = this.projects.filter(p => p.status === 'Active' || p.status === 'Planned');
        activeProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.code} - ${project.name}`;
            aiSelect.appendChild(option);
        });
    }

    populateProjectPersonnel() {
        const select = document.getElementById('projectLead');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add active personnel
        const activePersonnel = this.personnel.filter(p => p.status === 'Active');
        activePersonnel.forEach(personnel => {
            const option = document.createElement('option');
            option.value = personnel.id;
            option.textContent = `${personnel.name} (${personnel.role})`;
            select.appendChild(option);
        });
    }

    viewProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        const projectSCPs = this.projectSCPs.filter(scp => scp.projectId == id);
        const scpCount = projectSCPs.length;

        alert(`${project.name} (${project.code})\n\nType: ${project.type}\nLead: ${project.leadName}\nStatus: ${project.status}\nSCPs: ${scpCount}\n\n${project.description}`);
    }

    viewProjectSCP(id) {
        const scp = this.projectSCPs.find(s => s.id === id);
        if (!scp) return;

        const project = this.projects.find(p => p.id === scp.projectId);
        const projectName = project ? project.name : 'Unknown Project';

        alert(`SCP-${scp.number}: ${scp.name}\n\nProject: ${projectName}\nClass: ${scp.class}\n${scp.isAIGenerated ? '🤖 AI Generated\n' : ''}\n\nContainment: ${scp.containment}\n\nDescription: ${scp.description}`);
    }

    startRequestSimulation() {
        this.requestCheckInterval = setInterval(() => {
            this.checkForRequests();
        }, 45000); // Check every 45 seconds
    }

    checkForRequests() {
        const requestChance = 0.12; // 12% chance every 45 seconds
        if (Math.random() < requestChance) {
            this.generateRequest();
        }
    }

    generateRequest() {
        const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
        const activeMTFs = mtfs.filter(mtf => mtf.status === 'Active');
        
        const activePersonnel = this.personnel.filter(p => p.status === 'Active');
        
        if (activeMTFs.length === 0 && activePersonnel.length === 0) return;
        
        const requestTypes = [
            {
                type: 'equipment',
                messages: [
                    { from: 'MTF', text: 'requests advanced containment equipment for upcoming mission' },
                    { from: 'Personnel', text: 'needs specialized research equipment for SCP analysis' },
                    { from: 'MTF', text: 'requests upgraded armor for high-risk operations' },
                    { from: 'Personnel', text: 'requires new laboratory equipment for experiments' }
                ],
                cost: { resources: Math.floor(Math.random() * 50) + 25 },
                success: { containmentBonus: 0.15, missionSuccess: 0.1 },
                failure: { moralePenalty: 0.1, efficiencyPenalty: 0.05 }
            },
            {
                type: 'personnel',
                messages: [
                    { from: 'MTF', text: 'requests additional team members for upcoming operation' },
                    { from: 'Personnel', text: 'needs assistant researchers for complex SCP study' },
                    { from: 'MTF', text: 'requests specialized personnel for unique containment' },
                    { from: 'Personnel', text: 'requires backup staff for extended research' }
                ],
                cost: { personnel: Math.floor(Math.random() * 3) + 1 },
                success: { efficiencyBonus: 0.2, researchBonus: 0.15 },
                failure: { overworkPenalty: 0.1, stressPenalty: 0.08 }
            },
            {
                type: 'upgrade',
                messages: [
                    { from: 'MTF', text: 'requests facility upgrade for better SCP containment' },
                    { from: 'Personnel', text: 'needs security clearance upgrade for high-level SCPs' },
                    { from: 'MTF', text: 'requests training facility upgrade' },
                    { from: 'Personnel', text: 'requires containment cell modifications' }
                ],
                cost: { resources: Math.floor(Math.random() * 75) + 50 },
                success: { containmentBonus: 0.25, securityBonus: 0.2 },
                failure: { resourceWaste: 0.05, delayPenalty: 0.1 }
            },
            {
                type: 'leave',
                messages: [
                    { from: 'MTF', text: 'requests emergency leave due to mission stress' },
                    { from: 'Personnel', text: 'needs medical leave after SCP exposure' },
                    { from: 'MTF', text: 'requests rotation for team recovery' },
                    { from: 'Personnel', text: 'requires psychological leave after incident' }
                ],
                cost: { personnel: -1 },
                success: { moraleBonus: 0.2, healthBonus: 0.15 },
                failure: { burnoutPenalty: 0.15, stressPenalty: 0.12 }
            },
            {
                type: 'experiment',
                messages: [
                    { from: 'Personnel', text: 'requests permission to conduct dangerous SCP experiment' },
                    { from: 'MTF', text: 'wants to test new containment protocols' },
                    { from: 'Personnel', text: 'requests approval for cross-SCP testing' },
                    { from: 'MTF', text: 'needs to test new equipment against SCPs' }
                ],
                cost: { risk: Math.floor(Math.random() * 30) + 20 },
                success: { researchBonus: 0.3, containmentBonus: 0.2 },
                failure: { breachRisk: 0.1, containmentFailure: 0.05 }
            }
        ];
        
        const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        const message = requestType.messages[Math.floor(Math.random() * requestType.messages.length)];
        
        let requester;
        if (message.from === 'MTF' && activeMTFs.length > 0) {
            requester = activeMTFs[Math.floor(Math.random() * activeMTFs.length)];
        } else if (message.from === 'Personnel' && activePersonnel.length > 0) {
            requester = activePersonnel[Math.floor(Math.random() * activePersonnel.length)];
        } else {
            return;
        }
        
        const request = {
            id: Date.now(),
            type: requestType.type,
            requesterId: requester.id,
            requesterName: requester.name || requester.designation,
            requesterType: message.from,
            message: `${requester.name || requester.designation} ${message.text}`,
            cost: requestType.cost,
            success: requestType.success,
            failure: requestType.failure,
            timeRemaining: 4 * 60, // 4 minutes
            status: 'PENDING',
            created: new Date().toISOString()
        };
        
        this.requests.unshift(request);
        localStorage.setItem('requests', JSON.stringify(this.requests));
        
        this.displayRequestAlert(request);
        this.startRequestTimer(request);
    }

    displayRequestAlert(request) {
        const modal = document.createElement('div');
        modal.id = 'requestModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const minutes = Math.floor(request.timeRemaining / 60);
        const seconds = request.timeRemaining % 60;
        
        modal.innerHTML = `
            <div class="modal-content request-alert">
                <h2>📋 PERSONNEL REQUEST</h2>
                <div class="request-info">
                    <h3>${request.requesterType} Request</h3>
                    <p class="request-message">${request.message}</p>
                    <p class="request-timer">Time to respond: <span id="requestTimer">${minutes}:${seconds.toString().padStart(2, '0')}</span></p>
                    <div class="request-cost">
                        <h4>Costs:</h4>
                        ${Object.entries(request.cost).map(([key, value]) => 
                            `<span class="cost-item">${key}: ${value > 0 ? '+' : ''}${value}</span>`
                        ).join('')}
                    </div>
                    <div class="request-benefits">
                        <h4>Success Benefits:</h4>
                        ${Object.entries(request.success).map(([key, value]) => 
                            `<span class="benefit-item">${key}: +${Math.round(value * 100)}%</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="request-actions">
                    <button id="approveBtn" class="btn-primary">APPROVE</button>
                    <button id="denyBtn" class="btn-danger">DENY</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle button clicks
        modal.querySelector('#approveBtn').addEventListener('click', () => {
            this.approveRequest(request.id);
            modal.remove();
        });
        
        modal.querySelector('#denyBtn').addEventListener('click', () => {
            this.denyRequest(request.id);
            modal.remove();
        });
    }

    startRequestTimer(request) {
        const timer = setInterval(() => {
            const currentRequest = this.requests.find(r => r.id === request.id);
            if (!currentRequest || currentRequest.status !== 'PENDING') {
                clearInterval(timer);
                return;
            }
            
            currentRequest.timeRemaining--;
            
            const timerElement = document.getElementById('requestTimer');
            if (timerElement) {
                const minutes = Math.floor(currentRequest.timeRemaining / 60);
                const seconds = currentRequest.timeRemaining % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (currentRequest.timeRemaining <= 0) {
                this.autoDenyRequest(currentRequest);
                clearInterval(timer);
            }
        }, 1000);
    }

    approveRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;
        
        request.status = 'APPROVED';
        localStorage.setItem('requests', JSON.stringify(this.requests));
        
        // Apply benefits based on request type
        if (request.requesterType === 'MTF') {
            const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
            const mtfIndex = mtfs.findIndex(m => m.id === request.requesterId);
            if (mtfIndex !== -1) {
                mtfs[mtfIndex].efficiency = (mtfs[mtfIndex].efficiency || 1) * 1.1;
                mtfs[mtfIndex].morale = (mtfs[mtfIndex].morale || 1) + 0.1;
                localStorage.setItem('mtfs', JSON.stringify(mtfs));
            }
        } else if (request.requesterType === 'Personnel') {
            const personnelIndex = this.personnel.findIndex(p => p.id === request.requesterId);
            if (personnelIndex !== -1) {
                this.personnel[personnelIndex].efficiency = (this.personnel[personnelIndex].efficiency || 1) * 1.1;
                this.personnel[personnelIndex].satisfaction = (this.personnel[personnelIndex].satisfaction || 1) + 0.1;
                localStorage.setItem('personnel', JSON.stringify(this.personnel));
            }
        }
        
        alert(`✅ Request approved! ${request.requesterName} is grateful for your support.`);
        this.displayRequests();
    }

    denyRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;
        
        request.status = 'DENIED';
        localStorage.setItem('requests', JSON.stringify(this.requests));
        
        // Apply penalties
        if (request.requesterType === 'MTF') {
            const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
            const mtfIndex = mtfs.findIndex(m => m.id === request.requesterId);
            if (mtfIndex !== -1) {
                mtfs[mtfIndex].morale = (mtfs[mtfIndex].morale || 1) - 0.1;
                localStorage.setItem('mtfs', JSON.stringify(mtfs));
            }
        } else if (request.requesterType === 'Personnel') {
            const personnelIndex = this.personnel.findIndex(p => p.id === request.requesterId);
            if (personnelIndex !== -1) {
                this.personnel[personnelIndex].satisfaction = (this.personnel[personnelIndex].satisfaction || 1) - 0.1;
                localStorage.setItem('personnel', JSON.stringify(this.personnel));
            }
        }
        
        alert(`❌ Request denied. ${request.requesterName} is disappointed but will continue their duties.`);
        this.displayRequests();
    }

    autoDenyRequest(request) {
        request.status = 'AUTO_DENIED';
        localStorage.setItem('requests', JSON.stringify(this.requests));
        
        // Apply penalties for ignoring request
        if (request.requesterType === 'MTF') {
            const mtfs = JSON.parse(localStorage.getItem('mtfs') || '[]');
            const mtfIndex = mtfs.findIndex(m => m.id === request.requesterId);
            if (mtfIndex !== -1) {
                mtfs[mtfIndex].morale = (mtfs[mtfIndex].morale || 1) - 0.15;
                localStorage.setItem('mtfs', JSON.stringify(mtfs));
            }
        } else if (request.requesterType === 'Personnel') {
            const personnelIndex = this.personnel.findIndex(p => p.id === request.requesterId);
            if (personnelIndex !== -1) {
                this.personnel[personnelIndex].satisfaction = (this.personnel[personnelIndex].satisfaction || 1) - 0.15;
                localStorage.setItem('personnel', JSON.stringify(this.personnel));
            }
        }
        
        // Remove modal if it exists
        const modal = document.getElementById('requestModal');
        if (modal) modal.remove();
        
        alert(`⏰ Request from ${request.requesterName} expired and was automatically denied. Morale has decreased.`);
        this.displayRequests();
    }

    displayRequests() {
        const container = document.getElementById('requestsList');
        if (!container) return;
        
        const recentRequests = this.requests.slice(0, 10);
        
        if (recentRequests.length === 0) {
            container.innerHTML = '<p class="empty-state">No recent requests</p>';
            return;
        }

        container.innerHTML = recentRequests.map(request => `
            <div class="request-card ${request.status.toLowerCase()}">
                <h4>${request.requesterType} Request</h4>
                <p class="request-message">${request.message}</p>
                <span class="request-status ${request.status.toLowerCase()}">${request.status.replace('_', ' ')}</span>
                <small>${new Date(request.created).toLocaleString()}</small>
            </div>
        `).join('');
    }

    changeSiteStyle(e) {
        e.preventDefault();
        
        const selectedTheme = document.getElementById('siteStyleSelect').value;
        this.currentTheme = selectedTheme;
        
        localStorage.setItem('siteTheme', selectedTheme);
        this.loadTheme();
        
        alert(`Site style changed to: ${selectedTheme.replace(/_/g, ' ')}`);
    }
}

const app = new SCPFoundation();