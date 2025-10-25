        const questions = document.querySelectorAll('.faq-question');
        const searchInput = document.getElementById('searchInput');
        const noResults = document.getElementById('noResults');

        // Toggle FAQ
        questions.forEach(q => {
            q.addEventListener('click', () => {
                const answer = q.nextElementSibling;
                const isActive = answer.classList.contains('active');
                
                document.querySelectorAll('.faq-answer').forEach(a => {
                    a.classList.remove('active');
                });
                document.querySelectorAll('.faq-question').forEach(que => {
                    que.classList.remove('active');
                });
                
                if (!isActive) {
                    answer.classList.add('active');
                    q.classList.add('active');
                }
            });
        });

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase().trim();
            const allItems = document.querySelectorAll('.faq-item');
            const allCategories = document.querySelectorAll('.category');
            let foundAny = false;

            // Nếu ô tìm kiếm rỗng, hiển thị tất cả
            if (searchValue === '') {
                allItems.forEach(item => item.style.display = 'block');
                allCategories.forEach(cat => cat.style.display = 'block');
                noResults.style.display = 'none';
                return;
            }

            // Tìm kiếm trong từng item
            allItems.forEach(item => {
                const questionText = item.querySelector('.faq-question').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (questionText.includes(searchValue) || answerText.includes(searchValue)) {
                    item.style.display = 'block';
                    foundAny = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Ẩn/hiện category
            allCategories.forEach(category => {
                const items = category.querySelectorAll('.faq-item');
                let hasVisible = false;
                items.forEach(item => {
                    if (item.style.display !== 'none') {
                        hasVisible = true;
                    }
                });
                category.style.display = hasVisible ? 'block' : 'none';
            });

            // Hiển thị thông báo không tìm thấy
            noResults.style.display = foundAny ? 'none' : 'block';
        });