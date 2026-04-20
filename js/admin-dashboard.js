/**
 * Admin Dashboard Module
 * Complete project CRUD operations with file uploads
 */

let adminProjects = [];
let currentEditingProjectId = null;
let currentPage = 1;
const projectsPerPage = 10;
let selectedImage = null;
let selectedFile = null;

/**
 * Initialize admin dashboard
 */
async function initializeAdminDashboard() {
    try {
        console.log('Initializing admin dashboard...');
        
        await loadAdminProjects();
        setupProjectModal();
        setupDeleteModal();
        setupFileUploads();
        setupDashboardStats();
        setupLogoutButton();
        populateAdminName();
        
        console.log('✅ Admin dashboard initialized');
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

/**
 * Load projects for admin
 */
async function loadAdminProjects() {
    try {
        if (!db) {
            showToast('Firebase not initialized', 'error');
            return;
        }

        const snapshot = await db.collection('projects')
            .orderBy('createdAt', 'desc')
            .get();

        adminProjects = [];
        snapshot.forEach(doc => {
            adminProjects.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayAdminProjects();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading projects:', error);
        throw error;
    }
}

/**
 * Display projects in admin table
 */
function displayAdminProjects(page = 1) {
    const tableBody = document.getElementById('projects-table-body');
    if (!tableBody) return;

    if (adminProjects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                    <i class="fas fa-inbox text-3xl mb-3"></i>
                    <p>No projects yet. Create your first project!</p>
                </td>
            </tr>
        `;
        return;
    }

    // Pagination
    const startIndex = (page - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginatedProjects = adminProjects.slice(startIndex, endIndex);

    tableBody.innerHTML = paginatedProjects.map(project => `
        <tr class="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4 font-semibold text-gray-300">
                <div class="flex items-center gap-3">
                    <img src="${project.imageUrl}" alt="${project.title}" class="w-10 h-10 rounded object-cover">
                    <span>${truncate(project.title, 20)}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-400">
                <span class="px-2 py-1 rounded-full text-xs font-semibold" style="background: ${getCategoryColor(project.category)}20; color: ${getCategoryColor(project.category)};">
                    ${capitalize(project.category)}
                </span>
            </td>
            <td class="px-6 py-4 text-gray-400 text-sm">
                ${formatDate(project.createdAt)}
            </td>
            <td class="px-6 py-4 text-gray-400">
                <span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                    ${project.views || 0}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${project.featured ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-400'}">
                    ${project.featured ? '⭐ Featured' : 'Regular'}
                </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                <button class="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm edit-project-btn" data-project-id="${project.id}">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button class="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm delete-project-btn" data-project-id="${project.id}">
                    <i class="fas fa-trash mr-1"></i>Delete
                </button>
            </td>
        </tr>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project-id');
            openEditProjectModal(projectId);
        });
    });

    document.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project-id');
            const project = adminProjects.find(p => p.id === projectId);
            openDeleteModal(projectId, project.title);
        });
    });

    // Update pagination
    updateAdminPagination(adminProjects.length);
}

/**
 * Update dashboard stats
 */
function updateDashboardStats() {
    const totalProjectsEl = document.getElementById('total-projects');
    const totalViewsEl = document.getElementById('total-views');
    const featuredProjectsEl = document.getElementById('featured-projects');
    const lastUpdatedEl = document.getElementById('last-updated');

    if (totalProjectsEl) {
        totalProjectsEl.textContent = adminProjects.length;
    }

    if (totalViewsEl) {
        const totalViews = adminProjects.reduce((sum, p) => sum + (p.views || 0), 0);
        totalViewsEl.textContent = totalViews;
    }

    if (featuredProjectsEl) {
        const featured = adminProjects.filter(p => p.featured).length;
        featuredProjectsEl.textContent = featured;
    }

    if (lastUpdatedEl && adminProjects.length > 0) {
        lastUpdatedEl.textContent = formatDate(adminProjects[0].updatedAt || adminProjects[0].createdAt);
    }
}

/**
 * Setup dashboard stats and buttons
 */
function setupDashboardStats() {
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', openAddProjectModal);
    }

    const searchInput = document.getElementById('search-projects');
    const categoryFilter = document.getElementById('filter-category');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterAdminProjects, 300));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAdminProjects);
    }
}

/**
 * Filter admin projects
 */
function filterAdminProjects() {
    const searchInput = document.getElementById('search-projects');
    const categoryFilter = document.getElementById('filter-category');

    const searchQuery = searchInput?.value.toLowerCase().trim() || '';
    const category = categoryFilter?.value || '';

    let filtered = adminProjects;

    if (searchQuery) {
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery)
        );
    }

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    // Display filtered projects
    const tableBody = document.getElementById('projects-table-body');
    if (tableBody && filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>No projects found</p>
                </td>
            </tr>
        `;
        return;
    }

    // Show filtered results
    const paginatedFiltered = filtered.slice(0, projectsPerPage);
    if (tableBody) {
        tableBody.innerHTML = paginatedFiltered.map(project => `
            <tr class="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-300">
                    <div class="flex items-center gap-3">
                        <img src="${project.imageUrl}" alt="${project.title}" class="w-10 h-10 rounded object-cover">
                        <span>${truncate(project.title, 20)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-gray-400">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold" style="background: ${getCategoryColor(project.category)}20; color: ${getCategoryColor(project.category)};">
                        ${capitalize(project.category)}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-400 text-sm">
                    ${formatDate(project.createdAt)}
                </td>
                <td class="px-6 py-4 text-gray-400">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                        ${project.views || 0}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${project.featured ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-400'}">
                        ${project.featured ? '⭐ Featured' : 'Regular'}
                    </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button class="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm edit-project-btn" data-project-id="${project.id}">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button class="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm delete-project-btn" data-project-id="${project.id}">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.edit-project-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const projectId = btn.getAttribute('data-project-id');
                openEditProjectModal(projectId);
            });
        });

        document.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const projectId = btn.getAttribute('data-project-id');
                const project = adminProjects.find(p => p.id === projectId);
                openDeleteModal(projectId, project.title);
            });
        });
    }
}

/**
 * Setup project form modal
 */
function setupProjectModal() {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const addBtn = document.getElementById('add-project-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');

    if (addBtn) addBtn.addEventListener('click', openAddProjectModal);
    if (closeBtn) closeBtn.addEventListener('click', () => closeProjectModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeProjectModal());

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleProjectFormSubmit(form);
        });
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    // Title character counter
    const titleInput = form?.querySelector('input[name="title"]');
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            const count = document.getElementById('title-count');
            if (count) count.textContent = titleInput.value.length;
        });
    }
}

/**
 * Open add project modal
 */
function openAddProjectModal() {
    currentEditingProjectId = null;
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');

    if (form) form.reset();
    if (modalTitle) modalTitle.textContent = 'Add Project';
    if (submitText) submitText.textContent = 'Add Project';
    
    selectedImage = null;
    selectedFile = null;
    resetFileInputs();

    if (modal) modal.classList.remove('hidden');
}

/**
 * Open edit project modal
 */
function openEditProjectModal(projectId) {
    currentEditingProjectId = projectId;
    const project = adminProjects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const modalTitle = document.getElementById('modal-title');
    const submitText = document.getElementById('submit-text');

    // Populate form
    if (form) {
        form.querySelector('input[name="title"]').value = project.title;
        form.querySelector('textarea[name="description"]').value = project.description;
        form.querySelector('select[name="category"]').value = project.category;
        form.querySelector('input[name="techStack"]').value = project.techStack.join(', ');
        form.querySelector('input[name="githubLink"]').value = project.githubLink || '';
        form.querySelector('input[name="liveLink"]').value = project.liveLink || '';
        form.querySelector('input[name="featured"]').checked = project.featured || false;

        // Show image preview
        const imagePreview = form.querySelector('#image-preview');
        const imagePlaceholder = form.querySelector('#image-placeholder');
        const previewImg = form.querySelector('#preview-img');

        if (imagePreview && previewImg) {
            previewImg.src = project.imageUrl;
            imagePreview.classList.remove('hidden');
            imagePlaceholder.classList.add('hidden');
        }

        // Show file preview if exists
        if (project.fileUrl) {
            const filePreview = form.querySelector('#file-preview');
            const filePlaceholder = form.querySelector('#file-placeholder');
            const fileName = form.querySelector('#file-name');

            if (filePreview) {
                fileName.textContent = project.fileUrl.split('/').pop();
                filePreview.classList.remove('hidden');
                filePlaceholder.classList.add('hidden');
            }
        }
    }

    if (modalTitle) modalTitle.textContent = 'Edit Project';
    if (submitText) submitText.textContent = 'Update Project';

    if (modal) modal.classList.remove('hidden');
}

/**
 * Close project modal
 */
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.add('hidden');
    
    resetFileInputs();
    selectedImage = null;
    selectedFile = null;
}

/**
 * Handle project form submission
 */
async function handleProjectFormSubmit(form) {
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true);

        // Validate form
        const title = form.querySelector('input[name="title"]').value.trim();
        const description = form.querySelector('textarea[name="description"]').value.trim();
        const category = form.querySelector('select[name="category"]').value;
        const techStackInput = form.querySelector('input[name="techStack"]').value.trim();
        const featured = form.querySelector('input[name="featured"]').checked;

        if (!title || !description || !category || !techStackInput) {
            showToast('Please fill all required fields', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        // Parse tech stack
        const techStack = techStackInput.split(',').map(t => t.trim()).filter(t => t);

        // For new projects, require image
        if (!currentEditingProjectId && !selectedImage) {
            showToast('Please select a project image', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        // Upload image if selected
        let imageUrl = '';
        if (selectedImage) {
            imageUrl = await uploadFile(selectedImage, 'project-images');
        } else if (currentEditingProjectId) {
            // Keep existing image
            const existingProject = adminProjects.find(p => p.id === currentEditingProjectId);
            imageUrl = existingProject.imageUrl;
        }

        // Upload file if selected
        let fileUrl = '';
        if (selectedFile) {
            fileUrl = await uploadFile(selectedFile, 'project-files');
        } else if (currentEditingProjectId) {
            // Keep existing file
            const existingProject = adminProjects.find(p => p.id === currentEditingProjectId);
            fileUrl = existingProject.fileUrl || '';
        }

        // Prepare project data
        const projectData = {
            title,
            description,
            category,
            techStack,
            imageUrl,
            fileUrl,
            githubLink: form.querySelector('input[name="githubLink"]').value.trim() || '',
            liveLink: form.querySelector('input[name="liveLink"]').value.trim() || '',
            featured,
            updatedAt: new Date()
        };

        // Add or update project
        if (currentEditingProjectId) {
            // Update existing
            await db.collection('projects').doc(currentEditingProjectId).update(projectData);
            showToast('Project updated successfully!', 'success');
        } else {
            // Create new
            projectData.createdAt = new Date();
            projectData.views = 0;
            await db.collection('projects').add(projectData);
            showToast('Project added successfully!', 'success');
        }

        // Reload projects
        await loadAdminProjects();
        closeProjectModal();

    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Failed to save project', 'error');
    } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, false);
    }
}

// ============================================================================
// FILE UPLOAD HANDLING
// ============================================================================

/**
 * Setup file upload handlers
 */
function setupFileUploads() {
    setupImageUpload();
    setupFileUpload();
}

/**
 * Setup image upload drag and drop
 */
function setupImageUpload() {
    const imageDropZone = document.getElementById('image-drop-zone');
    const imageInput = document.getElementById('image-input');

    if (!imageDropZone) return;

    // Click to upload
    imageDropZone.addEventListener('click', () => imageInput.click());

    // Drag and drop
    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.classList.add('border-blue-500', 'bg-blue-500/10');
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
    });

    imageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageDropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageSelect(files[0]);
        }
    });

    // File input change
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageSelect(e.target.files[0]);
        }
    });

    // Remove button
    const removeImageBtn = document.getElementById('remove-image');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            selectedImage = null;
            imageInput.value = '';
            resetImagePreview();
        });
    }
}

/**
 * Handle image selection
 */
function handleImageSelect(file) {
    // Validate
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    if (file.size > 5242880) { // 5MB
        showToast('Image must be less than 5MB', 'error');
        return;
    }

    selectedImage = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('image-placeholder');
        const img = document.getElementById('preview-img');

        img.src = e.target.result;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

/**
 * Reset image preview
 */
function resetImagePreview() {
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-placeholder');

    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
}

/**
 * Setup file upload drag and drop
 */
function setupFileUpload() {
    const fileDropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');

    if (!fileDropZone) return;

    // Click to upload
    fileDropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('border-blue-500', 'bg-blue-500/10');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Remove button
    const removeFileBtn = document.getElementById('remove-file');
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            resetFilePreview();
        });
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    // Validate
    const validTypes = ['application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
    
    if (!validTypes.includes(file.type)) {
        showToast('Only PDF and ZIP files are allowed', 'error');
        return;
    }

    if (file.size > 52428800) { // 50MB
        showToast('File must be less than 50MB', 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const preview = document.getElementById('file-preview');
    const placeholder = document.getElementById('file-placeholder');
    const fileName = document.getElementById('file-name');

    fileName.textContent = file.name;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
}

/**
 * Reset file preview
 */
function resetFilePreview() {
    const preview = document.getElementById('file-preview');
    const placeholder = document.getElementById('file-placeholder');

    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
}

/**
 * Reset file inputs
 */
function resetFileInputs() {
    resetImagePreview();
    resetFilePreview();
    
    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');

    if (imageInput) imageInput.value = '';
    if (fileInput) fileInput.value = '';
}

/**
 * Upload file to Firebase Storage
 */
async function uploadFile(file, folder) {
    try {
        if (!storage) {
            throw new Error('Firebase Storage not initialized');
        }

        const fileName = `${generateId()}-${file.name}`;
        const storageRef = storage.ref(`${folder}/${fileName}`);

        // Show uploading toast
        showToast(`Uploading ${file.name}...`, 'info');

        // Upload file
        const snapshot = await storageRef.put(file);

        // Get download URL
        const url = await snapshot.ref.getDownloadURL();
        console.log(`✅ File uploaded: ${url}`);

        return url;
    } catch (error) {
        console.error('File upload error:', error);
        showToast('Failed to upload file', 'error');
        throw error;
    }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete project
 */
async function deleteProject(projectId) {
    try {
        if (!db || !storage) {
            throw new Error('Firebase not initialized');
        }

        const project = adminProjects.find(p => p.id === projectId);
        if (!project) return;

        showToast('Deleting project...', 'info');

        // Delete image from storage
        if (project.imageUrl) {
            try {
                const imageRef = storage.refFromURL(project.imageUrl);
                await imageRef.delete();
            } catch (err) {
                console.warn('Could not delete image:', err);
            }
        }

        // Delete file from storage
        if (project.fileUrl) {
            try {
                const fileRef = storage.refFromURL(project.fileUrl);
                await fileRef.delete();
            } catch (err) {
                console.warn('Could not delete file:', err);
            }
        }

        // Delete from Firestore
        await db.collection('projects').doc(projectId).delete();

        console.log('✅ Project deleted');
        showToast('Project deleted successfully!', 'success');

        // Reload projects
        await loadAdminProjects();
        closeDeleteModal();

    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Failed to delete project', 'error');
    }
}

/**
 * Setup delete modal
 */
function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('confirm-delete');
    const cancelBtn = document.getElementById('cancel-delete');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (currentEditingProjectId) {
                await deleteProject(currentEditingProjectId);
                currentEditingProjectId = null;
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeDeleteModal);
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDeleteModal();
            }
        });
    }
}

/**
 * Open delete confirmation modal
 */
function openDeleteModal(projectId, projectTitle) {
    currentEditingProjectId = projectId;
    const modal = document.getElementById('delete-modal');
    const projectName = document.getElementById('delete-project-name');

    if (projectName) projectName.textContent = projectTitle;
    if (modal) modal.classList.remove('hidden');
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.add('hidden');
    currentEditingProjectId = null;
}

// ============================================================================
// PAGINATION & UTILITIES
// ============================================================================

/**
 * Update pagination controls
 */
function updateAdminPagination(totalProjects) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const totalPages = Math.ceil(totalProjects / projectsPerPage);

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayAdminProjects(currentPage);
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayAdminProjects(currentPage);
            }
        };
    }
}

/**
 * Populate admin name
 */
function populateAdminName() {
    const adminNameEl = document.getElementById('admin-name');
    if (!adminNameEl) return;

    const adminUser = getStorageItem('adminUser');
    if (adminUser) {
        adminNameEl.textContent = `${adminUser.displayName} (${adminUser.email})`;
    }
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
} else {
    initializeAdminDashboard();
}
