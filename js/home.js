// Home Page Functions
document.addEventListener('DOMContentLoaded', function() {
    renderPopularBooks();
});

function renderPopularBooks() {
    const container = document.getElementById('popular-books-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show first 4 books as popular
    const popularBooks = books.slice(0, 4);
    
    if (popularBooks.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Hələ ki kitab yoxdur</h3></div>';
        return;
    }
    
    popularBooks.forEach(book => {
        renderBookCard(book, container);
    });
}