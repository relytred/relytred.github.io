// Recipe & Meal Planner Application
class RecipePlannerApp {
    constructor() {
        this.recipes = [];
        this.mealPlans = {};
        this.shoppingList = {};
        this.currentWeek = new Date();
        this.editingRecipeId = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderRecipes();
        this.renderMealPlanner();
        this.setupNavigation();
        this.updateCurrentWeekDisplay();
    }

    // Data Management
    loadData() {
        const savedRecipes = localStorage.getItem('recipes');
        const savedMealPlans = localStorage.getItem('mealPlans');
        const savedShoppingList = localStorage.getItem('shoppingList');

        if (savedRecipes) {
            this.recipes = JSON.parse(savedRecipes);
        } else {
            // Add some sample recipes for demo
            this.recipes = this.getSampleRecipes();
        }

        if (savedMealPlans) {
            this.mealPlans = JSON.parse(savedMealPlans);
        }

        if (savedShoppingList) {
            this.shoppingList = JSON.parse(savedShoppingList);
        }
    }

    saveData() {
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
        localStorage.setItem('mealPlans', JSON.stringify(this.mealPlans));
        localStorage.setItem('shoppingList', JSON.stringify(this.shoppingList));
    }

    getSampleRecipes() {
        return [
            {
                id: '1',
                name: 'Classic Spaghetti Carbonara',
                category: 'dinner',
                servings: 4,
                prepTime: 15,
                cookTime: 20,
                ingredients: ['400g spaghetti', '200g pancetta', '4 large eggs', '100g Parmesan cheese', 'Black pepper', 'Salt'],
                instructions: ['Boil pasta according to package instructions', 'Cook pancetta until crispy', 'Whisk eggs with Parmesan', 'Combine hot pasta with pancetta', 'Add egg mixture off heat, toss quickly'],
                dietaryTags: [],
                notes: 'The key is to mix the eggs off the heat to avoid scrambling!'
            },
            {
                id: '2',
                name: 'Avocado Toast with Poached Egg',
                category: 'breakfast',
                servings: 2,
                prepTime: 10,
                cookTime: 5,
                ingredients: ['2 slices whole grain bread', '1 ripe avocado', '2 eggs', '1 lemon', 'Salt', 'Pepper', 'Red pepper flakes'],
                instructions: ['Toast bread until golden', 'Mash avocado with lemon juice', 'Poach eggs in simmering water', 'Spread avocado on toast', 'Top with poached egg and seasonings'],
                dietaryTags: ['vegetarian'],
                notes: 'Add everything bagel seasoning for extra flavor!'
            },
            {
                id: '3',
                name: 'Chocolate Chip Cookies',
                category: 'dessert',
                servings: 24,
                prepTime: 15,
                cookTime: 12,
                ingredients: ['2¼ cups all-purpose flour', '1 tsp baking soda', '1 cup butter', '¾ cup sugar', '¾ cup brown sugar', '2 eggs', '2 tsp vanilla', '2 cups chocolate chips'],
                instructions: ['Preheat oven to 375°F', 'Mix flour and baking soda', 'Cream butter and sugars', 'Add eggs and vanilla', 'Combine wet and dry ingredients', 'Fold in chocolate chips', 'Bake 9-11 minutes'],
                dietaryTags: ['vegetarian'],
                notes: 'Slightly underbake for chewy cookies, bake longer for crispy ones.'
            }
        ];
    }

    // Navigation
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.dataset.section;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show target section
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');
                
                // Special handling for different sections
                if (targetSection === 'meal-planner') {
                    this.renderMealPlanner();
                } else if (targetSection === 'shopping-list') {
                    this.renderShoppingList();
                } else if (targetSection === 'search') {
                    this.renderSearchResults();
                }
            });
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Recipe Modal
        document.getElementById('add-recipe-btn').addEventListener('click', () => this.openRecipeModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeRecipeModal());
        document.getElementById('cancel-recipe').addEventListener('click', () => this.closeRecipeModal());
        document.getElementById('recipe-form').addEventListener('submit', (e) => this.handleRecipeSubmit(e));

        // Dynamic form elements
        document.getElementById('add-ingredient').addEventListener('click', () => this.addIngredientField());
        document.getElementById('add-instruction').addEventListener('click', () => this.addInstructionField());

        // Filters
        document.getElementById('category-filter').addEventListener('change', () => this.filterRecipes());
        document.getElementById('recipe-search').addEventListener('input', () => this.filterRecipes());

        // Meal Planner
        document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

        // Shopping List
        document.getElementById('generate-shopping-list').addEventListener('click', () => this.generateShoppingList());

        // Advanced Search
        document.getElementById('prep-time-slider').addEventListener('input', (e) => {
            document.getElementById('prep-time-value').textContent = e.target.value;
        });
        document.getElementById('apply-filters').addEventListener('click', () => this.applyAdvancedFilters());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('recipe-modal');
            if (e.target === modal) {
                this.closeRecipeModal();
            }
        });
    }

    // Recipe Management
    openRecipeModal(recipeId = null) {
        const modal = document.getElementById('recipe-modal');
        const form = document.getElementById('recipe-form');
        const title = document.getElementById('modal-title');
        
        this.editingRecipeId = recipeId;
        
        if (recipeId) {
            title.textContent = 'Edit Recipe';
            const recipe = this.recipes.find(r => r.id === recipeId);
            this.populateRecipeForm(recipe);
        } else {
            title.textContent = 'Add New Recipe';
            form.reset();
            this.resetFormFields();
        }
        
        modal.style.display = 'block';
    }

    closeRecipeModal() {
        document.getElementById('recipe-modal').style.display = 'none';
        this.editingRecipeId = null;
    }

    populateRecipeForm(recipe) {
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-category').value = recipe.category;
        document.getElementById('recipe-servings').value = recipe.servings;
        document.getElementById('recipe-prep-time').value = recipe.prepTime;
        document.getElementById('recipe-cook-time').value = recipe.cookTime;
        document.getElementById('recipe-notes').value = recipe.notes || '';

        // Dietary tags
        const checkboxes = document.querySelectorAll('.dietary-tags input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = recipe.dietaryTags.includes(cb.value);
        });

        // Ingredients
        this.populateListFields('ingredients-list', recipe.ingredients, 'ingredient-input', 'remove-ingredient');
        
        // Instructions
        this.populateListFields('instructions-list', recipe.instructions, 'instruction-input', 'remove-instruction');
    }

    populateListFields(containerId, items, inputClass, removeClass) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach(item => {
            if (containerId === 'ingredients-list') {
                this.addIngredientField(item);
            } else {
                this.addInstructionField(item);
            }
        });
    }

    resetFormFields() {
        // Reset to single ingredient and instruction fields
        document.getElementById('ingredients-list').innerHTML = `
            <div class="ingredient-item">
                <input type="text" placeholder="e.g., 2 cups flour" class="ingredient-input">
                <button type="button" class="remove-ingredient">×</button>
            </div>
        `;
        
        document.getElementById('instructions-list').innerHTML = `
            <div class="instruction-item">
                <textarea placeholder="Step 1: Describe the first step..." class="instruction-input"></textarea>
                <button type="button" class="remove-instruction">×</button>
            </div>
        `;
        
        this.setupFieldRemovalListeners();
    }

    addIngredientField(value = '') {
        const container = document.getElementById('ingredients-list');
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            <input type="text" placeholder="e.g., 2 cups flour" class="ingredient-input" value="${value}">
            <button type="button" class="remove-ingredient">×</button>
        `;
        container.appendChild(div);
        this.setupFieldRemovalListeners();
    }

    addInstructionField(value = '') {
        const container = document.getElementById('instructions-list');
        const div = document.createElement('div');
        div.className = 'instruction-item';
        div.innerHTML = `
            <textarea placeholder="Step ${container.children.length + 1}: Describe this step..." class="instruction-input">${value}</textarea>
            <button type="button" class="remove-instruction">×</button>
        `;
        container.appendChild(div);
        this.setupFieldRemovalListeners();
    }

    setupFieldRemovalListeners() {
        // Remove ingredient listeners
        document.querySelectorAll('.remove-ingredient').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true)); // Remove existing listeners
            btn = btn.parentNode.querySelector('.remove-ingredient');
            btn.addEventListener('click', (e) => {
                const container = document.getElementById('ingredients-list');
                if (container.children.length > 1) {
                    e.target.closest('.ingredient-item').remove();
                }
            });
        });

        // Remove instruction listeners
        document.querySelectorAll('.remove-instruction').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true)); // Remove existing listeners
            btn = btn.parentNode.querySelector('.remove-instruction');
            btn.addEventListener('click', (e) => {
                const container = document.getElementById('instructions-list');
                if (container.children.length > 1) {
                    e.target.closest('.instruction-item').remove();
                }
            });
        });
    }

    handleRecipeSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
            .map(input => input.value.trim())
            .filter(val => val);
        
        const instructions = Array.from(document.querySelectorAll('.instruction-input'))
            .map(input => input.value.trim())
            .filter(val => val);

        const dietaryTags = Array.from(document.querySelectorAll('.dietary-tags input:checked'))
            .map(cb => cb.value);

        if (ingredients.length === 0 || instructions.length === 0) {
            alert('Please add at least one ingredient and one instruction.');
            return;
        }

        const recipe = {
            id: this.editingRecipeId || Date.now().toString(),
            name: document.getElementById('recipe-name').value,
            category: document.getElementById('recipe-category').value,
            servings: parseInt(document.getElementById('recipe-servings').value),
            prepTime: parseInt(document.getElementById('recipe-prep-time').value),
            cookTime: parseInt(document.getElementById('recipe-cook-time').value),
            ingredients,
            instructions,
            dietaryTags,
            notes: document.getElementById('recipe-notes').value
        };

        if (this.editingRecipeId) {
            const index = this.recipes.findIndex(r => r.id === this.editingRecipeId);
            this.recipes[index] = recipe;
        } else {
            this.recipes.push(recipe);
        }

        this.saveData();
        this.renderRecipes();
        this.closeRecipeModal();
        this.showMessage('Recipe saved successfully!', 'success');
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            
            // Remove from meal plans
            Object.keys(this.mealPlans).forEach(date => {
                this.mealPlans[date] = this.mealPlans[date].filter(meal => meal.recipeId !== recipeId);
            });
            
            this.saveData();
            this.renderRecipes();
            this.renderMealPlanner();
            this.showMessage('Recipe deleted successfully!', 'success');
        }
    }

    // Recipe Rendering
    renderRecipes() {
        const container = document.getElementById('recipes-grid');
        const filteredRecipes = this.getFilteredRecipes();
        
        if (filteredRecipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No recipes found</h3>
                    <p>Start by adding your first recipe!</p>
                    <button class="btn btn-primary" onclick="app.openRecipeModal()">
                        <i class="fas fa-plus"></i> Add Recipe
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredRecipes.map(recipe => `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-category">${recipe.category}</span>
                        <div class="recipe-time">
                            <i class="fas fa-clock"></i>
                            ${recipe.prepTime + recipe.cookTime} min
                        </div>
                    </div>
                    ${recipe.dietaryTags.length > 0 ? `
                        <div class="recipe-tags">
                            ${recipe.dietaryTags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="recipe-actions">
                        <button class="btn btn-secondary" onclick="app.openRecipeModal('${recipe.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="app.deleteRecipe('${recipe.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFilteredRecipes() {
        const categoryFilter = document.getElementById('category-filter').value;
        const searchTerm = document.getElementById('recipe-search').value.toLowerCase();
        
        return this.recipes.filter(recipe => {
            const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
            const matchesSearch = !searchTerm || 
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));
            
            return matchesCategory && matchesSearch;
        });
    }

    filterRecipes() {
        this.renderRecipes();
    }

    // Meal Planner
    navigateWeek(direction) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        this.currentWeek = new Date(this.currentWeek.getTime() + (direction * oneWeek));
        this.updateCurrentWeekDisplay();
        this.renderMealPlanner();
    }

    updateCurrentWeekDisplay() {
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        const endOfWeek = new Date(startOfWeek.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const startStr = startOfWeek.toLocaleDateString('en-US', options);
        const endStr = endOfWeek.toLocaleDateString('en-US', options);
        
        document.getElementById('current-week').textContent = `${startStr} - ${endStr}`;
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    renderMealPlanner() {
        const container = document.getElementById('meal-planner-grid');
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        container.innerHTML = days.map((day, index) => {
            const date = new Date(startOfWeek.getTime() + (index * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            const dayMeals = this.mealPlans[dateStr] || [];
            
            return `
                <div class="day-column">
                    <div class="day-header">
                        <div class="day-name">${day}</div>
                        <div class="day-date">${date.getDate()}</div>
                    </div>
                    <div class="meals-container">
                        ${['Breakfast', 'Lunch', 'Dinner'].map(mealType => {
                            const meal = dayMeals.find(m => m.type === mealType.toLowerCase());
                            return `
                                <div class="meal-slot ${meal ? 'occupied' : ''}" 
                                     data-date="${dateStr}" 
                                     data-meal-type="${mealType.toLowerCase()}"
                                     onclick="app.selectMealSlot('${dateStr}', '${mealType.toLowerCase()}')">
                                    ${meal ? this.getMealDisplayName(meal.recipeId) : `Add ${mealType}`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    getMealDisplayName(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        return recipe ? recipe.name : 'Unknown Recipe';
    }

    selectMealSlot(date, mealType) {
        const recipes = this.recipes.filter(r => {
            if (mealType === 'breakfast') return r.category === 'breakfast';
            if (mealType === 'lunch') return ['lunch', 'dinner'].includes(r.category);
            if (mealType === 'dinner') return ['dinner', 'lunch'].includes(r.category);
            return true;
        });

        if (recipes.length === 0) {
            alert('No suitable recipes found. Please add some recipes first.');
            return;
        }

        const recipeOptions = recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        const currentMeal = (this.mealPlans[date] || []).find(m => m.type === mealType);
        
        const html = `
            <div class="meal-selector">
                <h3>Select Recipe for ${mealType}</h3>
                <select id="meal-recipe-select">
                    <option value="">Remove meal</option>
                    ${recipeOptions}
                </select>
                <div style="margin-top: 15px;">
                    <button onclick="app.saveMealSelection('${date}', '${mealType}')" class="btn btn-primary">Save</button>
                    <button onclick="app.closeMealSelector()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        // Create modal-like overlay
        const overlay = document.createElement('div');
        overlay.className = 'meal-selector-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 12px; 
            min-width: 300px; text-align: center;
        `;
        content.innerHTML = html;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Set current selection
        if (currentMeal) {
            document.getElementById('meal-recipe-select').value = currentMeal.recipeId;
        }

        this.currentMealSelector = overlay;
    }

    saveMealSelection(date, mealType) {
        const recipeId = document.getElementById('meal-recipe-select').value;
        
        if (!this.mealPlans[date]) {
            this.mealPlans[date] = [];
        }

        // Remove existing meal of this type
        this.mealPlans[date] = this.mealPlans[date].filter(m => m.type !== mealType);
        
        // Add new meal if recipe selected
        if (recipeId) {
            this.mealPlans[date].push({
                type: mealType,
                recipeId: recipeId
            });
        }

        this.saveData();
        this.renderMealPlanner();
        this.closeMealSelector();
    }

    closeMealSelector() {
        if (this.currentMealSelector) {
            document.body.removeChild(this.currentMealSelector);
            this.currentMealSelector = null;
        }
    }

    // Shopping List
    generateShoppingList() {
        const ingredients = {};
        const categories = {
            'Produce': ['tomato', 'onion', 'garlic', 'lemon', 'lime', 'apple', 'banana', 'lettuce', 'spinach', 'carrot', 'potato', 'bell pepper', 'avocado'],
            'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'bacon', 'ham'],
            'Dairy & Eggs': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'sour cream'],
            'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'pasta', 'rice', 'beans', 'sauce', 'spice'],
            'Bakery': ['bread', 'bagel', 'bun', 'roll'],
            'Other': []
        };

        // Collect ingredients from all meals in current week
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek.getTime() + (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            const dayMeals = this.mealPlans[dateStr] || [];
            
            dayMeals.forEach(meal => {
                const recipe = this.recipes.find(r => r.id === meal.recipeId);
                if (recipe) {
                    recipe.ingredients.forEach(ingredient => {
                        const key = ingredient.toLowerCase();
                        if (ingredients[key]) {
                            ingredients[key].count++;
                        } else {
                            ingredients[key] = { text: ingredient, count: 1 };
                        }
                    });
                }
            });
        }

        // Categorize ingredients
        const categorizedIngredients = { ...categories };
        Object.keys(categorizedIngredients).forEach(cat => {
            categorizedIngredients[cat] = [];
        });

        Object.values(ingredients).forEach(ingredient => {
            let categoryFound = false;
            for (const [category, keywords] of Object.entries(categories)) {
                if (keywords.some(keyword => ingredient.text.toLowerCase().includes(keyword))) {
                    categorizedIngredients[category].push(ingredient);
                    categoryFound = true;
                    break;
                }
            }
            if (!categoryFound) {
                categorizedIngredients['Other'].push(ingredient);
            }
        });

        this.shoppingList = categorizedIngredients;
        this.saveData();
        this.renderShoppingList();
        this.showMessage('Shopping list generated successfully!', 'success');
    }

    renderShoppingList() {
        const container = document.getElementById('shopping-categories');
        
        if (Object.keys(this.shoppingList).length === 0 || 
            Object.values(this.shoppingList).every(cat => cat.length === 0)) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No shopping list yet</h3>
                    <p>Generate a shopping list from your meal plan to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = Object.entries(this.shoppingList)
            .filter(([category, items]) => items.length > 0)
            .map(([category, items]) => `
                <div class="shopping-category">
                    <h3 class="category-title">${category}</h3>
                    <div class="shopping-items">
                        ${items.map((item, index) => `
                            <div class="shopping-item">
                                <input type="checkbox" id="item-${category}-${index}" 
                                       onchange="app.toggleShoppingItem(this)">
                                <label for="item-${category}-${index}">
                                    ${item.text} ${item.count > 1 ? `(×${item.count})` : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
    }

    toggleShoppingItem(checkbox) {
        const item = checkbox.closest('.shopping-item');
        if (checkbox.checked) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
    }

    // Advanced Search
    applyAdvancedFilters() {
        const searchTerm = document.getElementById('advanced-search-input').value.toLowerCase();
        const dietaryFilter = document.getElementById('dietary-filter').value;
        const maxPrepTime = parseInt(document.getElementById('prep-time-slider').value);
        
        const filteredRecipes = this.recipes.filter(recipe => {
            const matchesSearch = !searchTerm || 
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));
            
            const matchesDietary = !dietaryFilter || recipe.dietaryTags.includes(dietaryFilter);
            const matchesPrepTime = recipe.prepTime <= maxPrepTime;
            
            return matchesSearch && matchesDietary && matchesPrepTime;
        });

        this.renderSearchResults(filteredRecipes);
    }

    renderSearchResults(recipes = this.recipes) {
        const container = document.getElementById('search-results');
        
        if (recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No recipes match your criteria</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-category">${recipe.category}</span>
                        <div class="recipe-time">
                            <i class="fas fa-clock"></i>
                            ${recipe.prepTime + recipe.cookTime} min
                        </div>
                    </div>
                    ${recipe.dietaryTags.length > 0 ? `
                        <div class="recipe-tags">
                            ${recipe.dietaryTags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="recipe-actions">
                        <button class="btn btn-secondary" onclick="app.openRecipeModal('${recipe.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="app.deleteRecipe('${recipe.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    showMessage(text, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        const activeSection = document.querySelector('.content-section.active');
        activeSection.insertBefore(message, activeSection.firstChild);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RecipePlannerApp();
});
