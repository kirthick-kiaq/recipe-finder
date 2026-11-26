let recipes = [];

let recipeList = document.getElementById("recipeList");
let searchInput = document.getElementById("searchInput");
let searchBtn = document.getElementById("searchBtn");
let categorySelect = document.getElementById("categorySelect");
let recipeCount = document.getElementById("recipeCount");
let message = document.getElementById("message");
let noRecipes = document.getElementById("noRecipes");

function getIngredients(meal) {
    let ingredients = [];

    for (let i = 1; i <= 20; i++) {
        let ingredient = meal["strIngredient" + i];
        let quantity = meal["strMeasure" + i];

        if (ingredient && ingredient.trim() !== "") {
            ingredients.push({
                name: ingredient,
                quantity: quantity || ""
            });
        }
    }

    return ingredients;
}

function checkCategory(meal) {
    let ingredients = getIngredients(meal);

    let nonVegIngredients = [
        "chicken", "beef", "pork", "lamb", "mutton",
        "fish", "prawn", "shrimp", "crab", "lobster",
        "tuna", "salmon", "anchovy", "bacon", "ham",
        "turkey", "duck", "goat", "squid", "mussel",
        "oyster", "clam", "egg"
    ];

    let isNonVeg = ingredients.some(function(ingredient) {
        return nonVegIngredients.some(function(item) {
            return ingredient.name.toLowerCase().includes(item);
        });
    });

    if (isNonVeg) {
        return "nonveg";
    }

    return "veg";
}

function makeRecipe(meal) {
    return {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        category: checkCategory(meal),
        area: meal.strArea || "Recipe",
        ingredients: getIngredients(meal),
        instructions: meal.strInstructions || "No instructions available."
    };
}

async function searchRecipes() {
    let searchText = searchInput.value.trim();

    if (searchText === "") {
        message.textContent = "Please enter a recipe name.";
        recipeList.innerHTML = "";
        recipeCount.textContent = "";
        noRecipes.style.display = "none";
        recipes = [];
        return;
    }

    message.textContent = "Searching recipes...";
    recipeList.innerHTML = "";
    recipeCount.textContent = "";
    noRecipes.style.display = "none";

    try {
        let response = await fetch(
            "https://www.themealdb.com/api/json/v1/1/search.php?s=" +
            encodeURIComponent(searchText)
        );

        if (!response.ok) {
            throw new Error("Unable to search recipes");
        }

        let data = await response.json();

        recipes = data.meals || [];

        displayRecipes();
        message.textContent = "";

    } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
        console.log(error);
    }
}

function displayRecipes() {
    let selectedCategory = categorySelect.value;

    let filteredRecipes = recipes.filter(function(meal) {
        if (selectedCategory === "all") {
            return true;
        }

        return checkCategory(meal) === selectedCategory;
    });

    let recipeCards = filteredRecipes.map(function(meal) {
        let recipe = makeRecipe(meal);

        let categoryName = recipe.category === "veg" ? "Veg" : "Non-Veg";
        let tagClass = recipe.category === "veg" ? "veg-tag" : "nonveg-tag";

        return `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="recipe-card">
                    <img
                        src="${recipe.image}"
                        alt="${recipe.name}"
                        class="recipe-img"
                        loading="lazy"
                    >

                    <div class="recipe-info">
                        <span class="recipe-tag ${tagClass}">
                            ${categoryName}
                        </span>

                        <h3>${recipe.name}</h3>
                        <p>${recipe.area}</p>

                        <button class="view-recipe-btn" data-id="${recipe.id}">
                            View Recipe
                        </button>

                        <div class="recipe-details" id="recipe-${recipe.id}" hidden>
                            <h4>Ingredients</h4>

                            <ul>
                                ${recipe.ingredients.map(function(item) {
                                    return `<li>${item.quantity} ${item.name}</li>`;
                                }).join("")}
                            </ul>

                            <h4>Instructions</h4>
                            <p class="recipe-instructions">
                                ${recipe.instructions.replace(/\r?\n/g, "<br>")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    recipeList.innerHTML = recipeCards.join("");
    recipeCount.textContent = filteredRecipes.length + " recipes found";

    if (filteredRecipes.length === 0) {
        noRecipes.style.display = "block";
    } else {
        noRecipes.style.display = "none";
    }
}

recipeList.addEventListener("click", function(event) {
    if (event.target.classList.contains("view-recipe-btn")) {
        let recipeId = event.target.dataset.id;
        let recipeDetails = document.getElementById("recipe-" + recipeId);

        if (recipeDetails.hidden) {
            recipeDetails.hidden = false;
            event.target.textContent = "Hide Recipe";
        } else {
            recipeDetails.hidden = true;
            event.target.textContent = "View Recipe";
        }
    }
});

searchBtn.addEventListener("click", searchRecipes);

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchRecipes();
    }
});

categorySelect.addEventListener("change", function() {
    if (recipes.length > 0) {
        displayRecipes();
    }
});