// Blogger XML feed'inden yazıları GitHub sitenize eklemek için geliştirilmiş script
document.addEventListener('DOMContentLoaded', function() {
  // Blogger kullanıcı adı veya blog adresi
  const bloggerUrl = 'https://antalya-oto-tamircisi.blogspot.com'; // örn: 'example.blogspot.com'
  
  // Yüklenme durumunu göster
  const blogContainer = document.getElementById('blog-posts');
  if (blogContainer) {
    blogContainer.innerHTML = '<p>Yazılar yükleniyor...</p>';
  }
  
  // Google Feed API yerine alternatif çözüm: Blogger JSON API
  const feedUrl = `https://${bloggerUrl}/feeds/posts/default?alt=json&max-results=5&callback=displayBlogPosts`;
  
  // JSONP yaklaşımı kullanarak CORS sorunlarını aşma
  window.displayBlogPosts = function(data) {
    try {
      if (!data || !data.feed || !data.feed.entry) {
        throw new Error('Geçerli veri alınamadı');
      }
      
      const entries = data.feed.entry;
      let postsHtml = '';
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        
        // Yazı başlığı
        const title = entry.title.$t;
        
        // Yazı linki
        let postUrl = '';
        for (let j = 0; j < entry.link.length; j++) {
          if (entry.link[j].rel === 'alternate') {
            postUrl = entry.link[j].href;
            break;
          }
        }
        
        // Yayın tarihi
        const published = new Date(entry.published.$t);
        const formattedDate = published.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Yazı içeriği (özet)
        let content = '';
        if (entry.content) {
          content = entry.content.$t;
        } else if (entry.summary) {
          content = entry.summary.$t;
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
        if (postsHtml) {
          blogContainer.innerHTML = postsHtml;
        } else {
          blogContainer.innerHTML = '<p>Gösterilecek yazı bulunamadı.</p>';
        }
      }
    } catch (error) {
      console.error('Blog yazıları işlenirken hata:', error);
      if (blogContainer) {
        blogContainer.innerHTML = '<p>Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
      }
    }
  };
  
  // JSONP için script ekle
  const script = document.createElement('script');
  script.src = feedUrl;
  script.onerror = function() {
    console.error('Script yüklenemedi');
    if (blogContainer) {
      blogContainer.innerHTML = '<p>Blog servisine bağlanılamadı. Lütfen blog adresinizi kontrol edin.</p>';
    }
  };
  document.body.appendChild(script);
});

// Alternatif çözüm: Eğer yukarıdaki yöntem çalışmazsa, doğrudan blog URL'sine giden butonlar ekleyebiliriz
function addBloggerButtons() {
  const blogContainer = document.getElementById('blog-posts');
  if (!blogContainer) return;
  
  blogContainer.innerHTML += `
    <div class="blog-buttons" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <h3>Blog yazıları yüklenemedi. Doğrudan bloguma gitmek için:</h3>
      <a href="https://antalya-oto-tamircisi.blogspot.com" target="_blank" 
         style="display: inline-block; padding: 10px 20px; background-color: #0366d6; color: white; 
         text-decoration: none; border-radius: 4px; margin-top: 10px;">
        Blogumu Ziyaret Et
      </a>
    </div>
  `;
}

// 5 saniye sonra hala yüklenmemişse butonu göster
setTimeout(function() {
  if (document.getElementById('blog-posts').innerHTML.includes('Yazılar yükleniyor')) {
    addBloggerButtons();
  }
}, 5000);
