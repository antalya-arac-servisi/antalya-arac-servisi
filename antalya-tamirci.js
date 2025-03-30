document.addEventListener('DOMContentLoaded', function () {
  const bloggerFeedUrl = 'https://www.blogger.com/feeds/5762198629464425500/posts/default'; // Blog ID'nizi buraya ekleyin
  const maxResults = 5; // Gösterilecek yazı sayısı
  const blogContainer = document.getElementById('blog-posts');
  
  // CORS kısıtlamalarını aşmak için güvenilir bir proxy kullan
  const proxyUrl = 'https://corsproxy.io/?';
  const encodedFeedUrl = encodeURIComponent(`${bloggerFeedUrl}?max-results=${maxResults}`);

  fetch(proxyUrl + encodedFeedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.contents) {
        throw new Error('Geçersiz veri alındı, içerik boş!');
      }
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');

      if (entries.length === 0) {
        throw new Error('Hiç blog yazısı bulunamadı!');
      }

      let postsHtml = '';

      for (let i = 0; i < entries.length; i++) {
        const title = entries[i].getElementsByTagName('title')[0]?.textContent || 'Başlıksız';
        
        let postUrl = '';
        const links = entries[i].getElementsByTagName('link');
        for (let j = 0; j < links.length; j++) {
          if (links[j].getAttribute('rel') === 'alternate') {
            postUrl = links[j].getAttribute('href');
            break;
          }
        }
        
        const published = new Date(entries[i].getElementsByTagName('published')[0]?.textContent || Date.now());
        const formattedDate = published.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        let content = entries[i].getElementsByTagName('content')[0]?.textContent ||
                      entries[i].getElementsByTagName('summary')[0]?.textContent ||
                      'İçerik bulunamadı';

        // HTML etiketlerini kaldır ve metni kısalt
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const excerpt = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;

        // HTML ekleme
        postsHtml += `
          <div class="blog-post">
            <h2 class="post-title"><a href="${postUrl}" target="_blank">${title}</a></h2>
            <p class="post-date">${formattedDate}</p>
            <div class="post-excerpt">${excerpt}</div>
            <a href="${postUrl}" class="read-more" target="_blank">Devamını Oku</a>
          </div>
        `;
      }

      blogContainer.innerHTML = postsHtml;
    })
    .catch(error => {
      console.error('Blogger feed çekilirken hata oluştu:', error);
      if (blogContainer) {
        blogContainer.innerHTML = '<p>Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
      }
    });
});
