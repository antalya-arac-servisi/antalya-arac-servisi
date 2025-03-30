// Blogger XML feed'inden yazıları GitHub sitenize eklemek için script
document.addEventListener('DOMContentLoaded', function() {
  const bloggerFeedUrl = 'https://www.blogger.com/feeds/5762198629464425500/posts/default'; // Blog ID'nizi buraya ekleyin
  const maxResults = 5; // Gösterilecek yazı sayısı
  const blogContainer = document.getElementById('blog-posts');
  
  // CORS kısıtlamalarını aşmak için proxy kullanımı
  const proxyUrl = 'https://api.allorigins.win/get?url=';
  const encodedFeedUrl = encodeURIComponent(bloggerFeedUrl + '?max-results=' + maxResults);
  
  // Feed'i çekme ve işleme
  fetch(proxyUrl + encodedFeedUrl)
    .then(response => response.json())
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');
      
      let postsHtml = '';
      
      for (let i = 0; i < entries.length; i++) {
        // Yazı başlığı
        const title = entries[i].getElementsByTagName('title')[0].textContent;
        
        // Yazı linki
        const links = entries[i].getElementsByTagName('link');
        let postUrl = '';
        for (let j = 0; j < links.length; j++) {
          if (links[j].getAttribute('rel') === 'alternate') {
            postUrl = links[j].getAttribute('href');
            break;
          }
        }
        
        // Yayın tarihi
        const published = new Date(entries[i].getElementsByTagName('published')[0].textContent);
        const formattedDate = published.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Yazı içeriği (özet)
        let content = '';
        if (entries[i].getElementsByTagName('content').length > 0) {
          content = entries[i].getElementsByTagName('content')[0].textContent;
        } else if (entries[i].getElementsByTagName('summary').length > 0) {
          content = entries[i].getElementsByTagName('summary')[0].textContent;
        }
        
        // İçerikten HTML etiketlerini kaldırma ve kısaltma
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        const excerpt = textContent.substring(0, 150) + '...';
        
        // HTML oluşturma
        postsHtml += `
          <div class="blog-post">
            <h2 class="post-title"><a href="${postUrl}" target="_blank">${title}</a></h2>
            <p class="post-date">${formattedDate}</p>
            <div class="post-excerpt">${excerpt}</div>
            <a href="${postUrl}" class="read-more" target="_blank">Devamını Oku</a>
          </div>
        `;
      }
      
      // İçeriği sayfaya ekleme
      if (blogContainer) {
        blogContainer.innerHTML = postsHtml;
      } else {
        console.error('Blog posts container not found!');
      }
    })
    .catch(error => {
      console.error('Blogger feed çekilirken hata oluştu:', error);
      if (blogContainer) {
        blogContainer.innerHTML = '<p>Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
      }
    });
});
