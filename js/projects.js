/**
 * Projects Module - Fetch and Display Projects
 */

let currentPage = 1;
const projectsPerPage = 9;
let allProjects = [];
let filteredProjects = [];
let currentFilter = 'all';

/**
 * Initialize projects section
 */
async function initializeProjects() {
    try {
        console.log('Loading projects...');
        await fetchProjects();
        setupFilterButtons();
        displayProjects();
        setupProjectModal();
        console.log('✅ Projects initialized');
    } catch (error) {
        console.error('❌ Error initializing projects:', error);
        showToast('Failed to load projects', 'error');
    }
}

/**
 * Fetch projects from Firestore
 */
async function fetchProjects() {
    try {
        if (!db) {
            console.warn('Firebase not initialized');
            return;
        }

        const snapshot = await db.collection('projects')
            .orderBy('createdAt', 'desc')
            .get();

        allProjects = [];
        snapshot.forEach(doc => {
            allProjects.push({
                id: doc.id,
                ...doc.data()
            });
        });

        filteredProjects = allProjects;
        console.log(`✅ Loaded ${allProjects.length} projects`);
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
}

/**
 * Setup filter buttons
 */
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-filter');
            currentPage = 1;
            filterProjects();
            displayProjects();
        });
    });
}

/**
 * Filter projects by category
 */
function filterProjects() {
    if (currentFilter === 'all') {
        filteredProjects = allProjects;
    } else {
        filteredProjects = allProjects.filter(project => 
            project.category === currentFilter
        );
    }
}

/**
 * Display projects with pagination
 */
function displayProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (filteredProjects.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No projects found in this category</p>
            </div>
        `;
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    // Generate HTML
    grid.innerHTML = paginatedProjects.map(project => `
        <div class="project-card group rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-blue-500 transition-all duration-300 cursor-pointer" data-project-id="${project.id}">
            <!-- Image -->
            <div class="relative overflow-hidden h-48 bg-gray-800">
                <img 
                    src="${project.imageUrl}" 
                    alt="${project.title}"
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Category Badge -->
                <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3" style="background: ${getCategoryColor(project.category)}20; color: ${getCategoryColor(project.category)};">
                    ${capitalize(project.category)}
                </div>

                <!-- Title -->
                <h3 class="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    ${project.title}
                </h3>

                <!-- Description -->
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">
                    ${project.description}
                </p>

                <!-- Tech Stack -->
                <div class="flex flex-wrap gap-2 mb-4">
                    ${project.techStack.slice(0, 3).map(tech => `
                        <span class="px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-300">
                            ${tech}
                        </span>
                    `).join('')}
                    ${project.techStack.length > 3 ? `
                        <span class="px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-400">
                            +${project.techStack.length - 3}
                        </span>
                    ` : ''}
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-semibold view-project-btn">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    ${project.liveLink ? `
                        <a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="flex-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-semibold text-center">
                            <i class="fas fa-external-link-alt mr-1"></i>Live
                        </a>
                    ` : ''}
                    ${project.githubLink ? `
                        <a href="${project.githubLink}" target="_blank" rel="noopener noreferrer" class="flex-1 px-3 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-semibold text-center">
                            <i class="fab fa-github mr-1"></i>Code
                        </a>
                    ` : ''}
                    ${project.fileUrl ? `
                        <a href="${project.fileUrl}" download class="flex-1 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm font-semibold text-center">
                            <i class="fas fa-download mr-1"></i>Files
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to view buttons
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.project-card');
            const projectId = card.getAttribute('data-project-id');
            const project = allProjects.find(p => p.id === projectId);
            if (project) showProjectModal(project);
        });
    });

    // Setup pagination
    updatePagination();
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const showingCount = document.getElementById('showing-count');
    const totalCount = document.getElementById('total-count');

    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProjects();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayProjects();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (showingCount && totalCount) {
        const startIndex = (currentPage - 1) * projectsPerPage + 1;
        const endIndex = Math.min(currentPage * projectsPerPage, filteredProjects.length);
        showingCount.textContent = endIndex;
        totalCount.textContent = filteredProjects.length;
    }
}

/**
 * Setup project modal
 */
function setupProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });

    // Close on button click
    const closeBtn = modal.querySelector('button');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
}

/**
 * Show project details in modal
 */
function showProjectModal(project) {
    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');

    if (!modal || !content) return;

    content.innerHTML = `
        <!-- Image -->
        <div class="mb-6">
            <img 
                src="${project.imageUrl}" 
                alt="${project.title}"
                class="w-full h-96 object-cover rounded-lg"
            >
        </div>

        <!-- Header -->
        <div class="mb-6">
            <h2 class="text-3xl font-bold mb-2">${project.title}</h2>
            <p class="text-gray-400">${project.description}</p>
        </div>

        <!-- Category & Stats -->
        <div class="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div class="grid grid-cols-3 gap-4">
                <div>
                    <p class="text-xs text-gray-400 mb-1">Category</p>
                    <p class="font-semibold">${capitalize(project.category)}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-400 mb-1">Created</p>
                    <p class="font-semibold">${formatDate(project.createdAt)}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-400 mb-1">Views</p>
                    <p class="font-semibold">${project.views || 0}</p>
                </div>
            </div>
        </div>

        <!-- Tech Stack -->
        <div class="mb-6">
            <h3 class="text-lg font-bold mb-3">Tech Stack</h3>
            <div class="flex flex-wrap gap-2">
                ${project.techStack.map(tech => `
                    <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                        ${tech}
                    </span>
                `).join('')}
            </div>
        </div>

        <!-- Action Links -->
        <div class="grid grid-cols-2 gap-3 mb-6">
            ${project.liveLink ? `
                <a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-center font-semibold">
                    <i class="fas fa-external-link-alt mr-2"></i>Live Demo
                </a>
            ` : ''}
            ${project.githubLink ? `
                <a href="${project.githubLink}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-center font-semibold">
                    <i class="fab fa-github mr-2"></i>Source Code
                </a>
            ` : ''}
            ${project.fileUrl ? `
                <a href="${project.fileUrl}" download class="p-3 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-center font-semibold col-span-2">
                    <i class="fas fa-download mr-2"></i>Download Files
                </a>
            ` : ''}
        </div>

        <!-- Case Study Section -->
        <div class="border-t border-gray-700 pt-6">
            <h3 class="text-lg font-bold mb-4">Project Details</h3>
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-blue-400 mb-2">🎯 Challenge</h4>
                    <p class="text-gray-300">${project.description}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-blue-400 mb-2">💡 Solution</h4>
                    <p class="text-gray-300">Built using ${project.techStack.slice(0, 3).join(', ')} with focus on performance and user experience.</p>
                </div>
                <div>
                    <h4 class="font-semibold text-blue-400 mb-2">📊 Impact</h4>
                    <p class="text-gray-300">Successfully delivered and deployed to production with excellent performance metrics.</p>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    // Increment view count
    if (db && project.id) {
        db.collection('projects').doc(project.id).update({
            views: (project.views || 0) + 1
        }).catch(err => console.warn('Could not update views:', err));
    }
}

/**
 * Close project modal
 */
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Get category color
 */
function getCategoryColor(category) {
    const colors = {
        web: '#3b82f6',
        ai: '#a855f7',
        data: '#06b6d4',
        mobile: '#ec4899'
    };
    return colors[category] || '#3b82f6';
}

/**
 * Setup search functionality
 */
function setupProjectSearch() {
    const searchInput = document.getElementById('search-projects');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            filterProjects();
        } else {
            filteredProjects = allProjects.filter(project =>
                project.title.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query) ||
                project.techStack.some(tech => tech.toLowerCase().includes(query))
            );
        }

        currentPage = 1;
        displayProjects();
    }, 300));
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeProjects();
        setupProjectSearch();
    });
} else {
    initializeProjects();
    setupProjectSearch();
}
