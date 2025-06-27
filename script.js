// main-script.js

let selectedIds = [];
let filteredProducts = [...products]; // copy of original products for filtering

function getStarRating(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function renderProducts(productsToRender) {
  const productList = $('.product-list');
  productList.empty();

  if (productsToRender.length === 0) {
    productList.append(`<p class="no-products-msg">No products found.</p>`);
    return;
  }

  productsToRender.forEach(product => {
    const isSelected = selectedIds.includes(product.id);

    const card = $(`
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <div class="rating">${getStarRating(product.rating)}</div>
        <p>₹${product.price}</p>
        <button class="${isSelected ? 'added' : ''}" data-id="${product.id}" ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'Added to Compare' : 'Add to Compare'}
        </button>
      </div>
    `);

    productList.append(card);
  });

  attachButtonEvents(productsToRender);
}


function attachButtonEvents(productsToRender) {
  $('.product-card button').off('click').on('click', function () {
    const id = parseInt($(this).data('id'));

    if (selectedIds.length >= 3) {
      alert('You can only compare up to 3 products.');
      return;
    }

    if (!selectedIds.includes(id)) {
      selectedIds.push(id);
      renderProducts(productsToRender);
      renderComparison(products);

      // Scroll to compare section if 2 products selected
      if (selectedIds.length === 2) {
        setTimeout(() => {
          document.querySelector('.compare-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  });
}


function renderComparison(products) {
  const section = $('.compare-section');
  const selected = products.filter(p => selectedIds.includes(p.id));

  if (selected.length >= 2) {
    section.show();
  } else {
    section.hide();
    return;
  }

  section.empty();

  const header = $(`
    <div class="header-with-reset">
      <h2 class="section-title" style="color: #444DA1;">Compare Mobiles</h2>
      <button class="reset-btn">Reset Comparison</button>
    </div>
  `);

  section.append(header);

  header.find('.reset-btn').on('click', function () {
    resetComparison(products);
  });

  const grid = $('<div class="compare-grid"></div>');
  const features = ['image', 'name', 'price', 'rating', 'ram', 'camera', 'battery', 'resolution'];

  features.forEach(feature => {
    const row = $('<div class="compare-row"></div>');
    let label = feature.charAt(0).toUpperCase() + feature.slice(1);
    row.append(`<div class="feature-label">${label}</div>`);

    const values = [];

    selected.forEach(product => {
      let value = '';
      if (feature === 'image') {
        value = `<img src="${product.image}" alt="${product.name}" />`;
      } else if (feature === 'rating') {
        value = `<div class="rating">${getStarRating(product.rating)}</div>`;
      } else if (product[feature]) {
        value = product[feature];
      } else if (product.features && product.features[feature]) {
        value = product.features[feature];
      }
      values.push(value);
    });

    const plainTextValues = values.map(v => v.replace(/<[^>]*>/g, ''));
    const uniqueSet = new Set(plainTextValues);
    const isDifferent = uniqueSet.size > 1;

    if (isDifferent && !['image', 'name', 'price', 'rating'].includes(feature)) {
      row.addClass('feature-diff');
    }

    selected.forEach((product, i) => {
      let content = values[i];

      // Add remove button only in the 'name' row
      if (feature === 'name') {
          content = `
            <div class="remove-wrapper">
              <div class="remove-btn" data-id="${product.id}" title="Remove">×</div>
              <div>${content}</div>
            </div>
          `;
      }


      row.append(`<div class="product-column">${content}</div>`);
    });


    grid.append(row);
  });

  section.append(grid);
  $('.remove-btn').on('click', function () {
      const id = parseInt($(this).data('id'));
      selectedIds = selectedIds.filter(pid => pid !== id);
      renderProducts(filteredProducts);
      renderComparison(products);
    });
}

function resetComparison(products) {
  selectedIds = [];
  $('.compare-section').hide();
  renderProducts(filteredProducts);
}

$(document).ready(function () {
  $(document).ready(function () {
  // Render search input and clear icon
  $('.search-container').html(`
    <input type="text" id="search-input" placeholder="Search with name or brand..." />
    <span id="clear-search" title="Clear search">×</span>
  `);

  $('#search-input').on('input', function () {
    const term = $(this).val().toLowerCase();
        $('#clear-search').toggle(term.length > 0); // show/hide × icon

        filteredProducts = products.filter(p =>
          p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
        );
        renderProducts(filteredProducts);
      });

      $('#clear-search').on('click', function () {
        $('#search-input').val('');
        $(this).hide();
        filteredProducts = [...products];
        renderProducts(filteredProducts);
      });

  renderProducts(filteredProducts);
});

});
