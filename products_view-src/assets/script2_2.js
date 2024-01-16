document.addEventListener('DOMContentLoaded', function () {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const productsContainer = document.querySelector('.products-container');
    const previewContainer = document.querySelector('.selected-product-preview');

    let currentPosition = 0;
    let startX = 0;
    const productWidth = document.querySelector('.product').offsetWidth + 10;

    fetch('products_foods.txt')
        .then(response => response.text())
        .then(data => {
            const products = parseProductData(data);

            updatePreview(products[0]);

            displayProducts(products);
        });

    arrowLeft.addEventListener('click', function () {
        if (currentPosition < 0) {
            currentPosition += productWidth;
            updateTransform();
        }
    });

    arrowRight.addEventListener('click', function () {
        const containerWidth = productsContainer.offsetWidth;
        const maxPosition = -((productWidth * document.querySelectorAll('.product').length) - containerWidth);

        if (currentPosition > maxPosition) {
            currentPosition -= productWidth;
            updateTransform();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
            arrowLeft.click();
        } else if (event.key === 'ArrowRight') {
            arrowRight.click();
        }
    });

    productsContainer.addEventListener('touchstart', function (event) {
        startX = event.touches[0].clientX;
    });

    productsContainer.addEventListener('touchmove', function (event) {
        const diffX = event.touches[0].clientX - startX;

        if (diffX > 50) {
            arrowLeft.click();
        } else if (diffX < -50) {
            arrowRight.click();
        }
    });

    function updateTransform() {
        productsContainer.style.transform = `translateX(${currentPosition}px)`;
    }

    function parseProductData(data) {
        const productEntries = data.split('\n\n');
        const products = [];
    
        let currentProductId = 20;
    
        for (const entry of productEntries) {
            const product = {};
            const lines = entry.split('\n');
    
            for (const line of lines) {
                const [key, value] = line.split(':').map(str => str.trim());
    
                if (key === 'product_id') {
                    product[key] = currentProductId++;
                } else if (key && value) {
                    product[key] = value;
                }
            }
    
            products.push(product);
        }
    
        return products;
    }
    
    function displayProducts(products) {
        productsContainer.innerHTML = '';
    
        products.forEach(async product => {
            const meanRating = await calculateMeanRating(product.product_id); 
    
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.setAttribute('data-product-id', product.product_id); 
            productElement.innerHTML = `
                <img src="products/fds/${product.product_id}.png" alt="${product.Name}">
                <h2>${product.Name}</h2>
                <h2>${product.Prices}</h2>
                <h2>${meanRating} 🍋</h2> 
            `;
    
            productElement.addEventListener('click', function () {
                updatePreview(product);
            });
    
            productsContainer.appendChild(productElement);
        });
    }
    
    async function calculateMeanRating(product_id) {
        try {
            const response = await fetch(`get_feedbacks.php?product_id=${product_id}`);
            const data = await response.json();
            return data.meanRating;
        } catch (error) {
            console.error('Error fetching mean rating:', error);
            return 0; 
        }
    }


    function updatePreview(product) {
        const imagePath = `products/fds/${product.product_id}.png`;
        previewContainer.innerHTML = `
            <div class="product-image">
                <img src="${imagePath}" alt="${product.Name}">
            </div>
            <div class="product-details">
                <h2>${product.Name}</h2>
                <p><i>${product.Description}</i></p>
                <h1>${product.Prices}</h1>
    
                <p>; Rating: <span class="mean-rating-placeholder">Calculating...</span></p> 
    
                <form method="post" class="feedback-form">
                    <div class="form-group">
                        <label for="rating">Rate ; :</label>
                        <div class="star-rating">
                            <input type="radio" id="star5" name="rating" value="5">
                            <label for="star5">;</label>
                            <input type="radio" id="star4" name="rating" value="4">
                            <label for="star4">;</label>
                            <input type="radio" id="star3" name="rating" value="3">
                            <label for="star3">;</label>
                            <input type="radio" id="star2" name="rating" value="2">
                            <label for="star2">;</label>
                            <input type="radio" id="star1" name="rating" value="1">
                            <label for="star1">;</label>
                        </div>
                    </div>
    
                    <div class="form-group">
                        <label for="name">Your Name:</label>
                        <input type="text" name="name" id="name" required>
                    </div>
                    <div class="form-group">
                        <textarea name="feedback" id="feedback" rows="5" columns="2" maxlength="500" placeholder="Your Feedback (max 500 characters)" required></textarea>
    </div>
    
                    <input type="hidden" name="product_id" value="${product.product_id}">
    
                    <button type="submit" class="submit-button">placeholder</button>
                </form>
    
                <hr>
    
                <div class="feedback-section">
                    <h3>Discover What Others Say:</h3>
                </div>
            </div>
        `;
    
        const meanRatingPlaceholder = document.querySelector('.mean-rating-placeholder');
        calculateMeanRating(product.product_id)
            .then(meanRating => {
                meanRatingPlaceholder.textContent = `${meanRating} 🍋`;
            })
            .catch(error => {
                console.error('Error fetching mean rating:', error);
                meanRatingPlaceholder.textContent = 'N/A';
            });
    
        fetch(`get_feedbacks.php?product_id=${product.product_id}`)
            .then(response => response.json())
            .then(data => {
                const feedbackSection = document.querySelector('.feedback-section');
                feedbackSection.innerHTML = ''; 
    
                data.feedbacks.forEach(feedback => {
                    const feedbackElement = document.createElement('div');
                    feedbackElement.classList.add('feedback');
                    const starRating = '🍋'.repeat(parseInt(feedback.rating));
                    feedbackElement.innerHTML = `
                        <p>Name: ${feedback.name.substring(0, 4)}*****</p>
                        <p>Rating: ${starRating}</p>
                        <p><i>${feedback.feedback}</i></p>
                    `;
                    feedbackSection.appendChild(feedbackElement);
                });
            });
    }
});