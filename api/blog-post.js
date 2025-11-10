// api/blog-post.js
export default async function handler(req, res) {
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    // Fetch post data from Sanity
    const PROJECT_ID = 'bcqvqm54';
    const DATASET = 'production';
    const query = `*[_type == "post" && slug.current == "${slug}"][0] {
  title,
  slug,
  excerpt,
  publishedAt,
  body,
  mainImage,
  categories[]->{
    title,
    slug
  }
}`;
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodedQuery}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }
    
    const data = await response.json();
    const post = data.result;
    
    if (!post) {
      return res.status(404).send(generateErrorPage('Post not found'));
    }

    // Generate the HTML with proper meta tags
    const html = generateBlogPostHTML(post);
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error loading post:', error);
    res.status(500).send(generateErrorPage('Failed to load post'));
  }
}

function extractFirstParagraph(blocks) {
  if (!blocks || !Array.isArray(blocks)) return 'Read the latest insights on product leadership and strategy.';
  
  for (const block of blocks) {
    if (block._type === 'block' && block.children && block.style === 'normal') {
      const text = block.children
        .filter(child => child._type === 'span' && child.text)
        .map(child => child.text)
        .join('');
      
      if (text.trim().length > 50) {
        return text.trim().substring(0, 160) + '...';
      }
    }
  }
  
  return 'Read the latest insights on product leadership and strategy.';
}

function blocksToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '<p>No content available.</p>';
  
  let html = '';
  let inList = false;
  let listType = null;
  
  blocks.forEach((block, index) => {
    // Handle text blocks (paragraphs, headings, etc.)
    if (block._type === 'block' && block.children) {
      const style = block.style || 'normal';
      const markDefs = block.markDefs || [];
      const listItem = block.listItem;
      const level = block.level || 1;
      
      // Process text content with marks (bold, italic, etc.)
      const text = block.children
        .map(child => {
          if (child._type === 'span') {
            let content = child.text || '';
            
            // Apply text marks
            if (child.marks && child.marks.length > 0) {
    child.marks.forEach(mark => {
        // Check for links first
        const linkDef = markDefs.find(def => def._key === mark);
        if (linkDef && linkDef._type === 'link') {
            content = `<a href="${linkDef.href}" target="_blank" rel="noopener">${content}</a>`;
        } else {
            // Handle other formatting marks
            switch (mark) {
                case 'strong':
                    content = `<strong>${content}</strong>`;
                    break;
                case 'em':
                    content = `<em>${content}</em>`;
                    break;
                case 'underline':
                    content = `<u>${content}</u>`;
                    break;
                case 'strike-through':
                case 'strike':
                    content = `<s>${content}</s>`;
                    break;
                case 'code':
                    content = `<code>${content}</code>`;
                    break;
            }
        }
    });
}
            
            return content;
          }
          return '';
        })
        .join('');
      
      if (text.trim()) {
        // Handle list items
        if (listItem === 'bullet' || listItem === 'number') {
          const currentListType = listItem === 'bullet' ? 'ul' : 'ol';
          
          // Start new list or continue existing
          if (!inList || listType !== currentListType) {
            if (inList) html += `</${listType}>`;
            html += `<${currentListType}>`;
            inList = true;
            listType = currentListType;
          }
          
          html += `<li>${text}</li>`;
        } else {
          // Close any open list
          if (inList) {
            html += `</${listType}>`;
            inList = false;
            listType = null;
          }
          
          // Handle regular blocks
          switch (style) {
            case 'h1':
              html += `<h1>${text}</h1>`;
              break;
            case 'h2':
              html += `<h2>${text}</h2>`;
              break;
            case 'h3':
              html += `<h3>${text}</h3>`;
              break;
            case 'h4':
              html += `<h4>${text}</h4>`;
              break;
            case 'h5':
              html += `<h5>${text}</h5>`;
              break;
            case 'h6':
              html += `<h6>${text}</h6>`;
              break;
            case 'blockquote':
              html += `<blockquote>${text}</blockquote>`;
              break;
            default:
              html += `<p>${text}</p>`;
              break;
          }
        }
      }
    }
    
    // Handle images
    else if (block._type === 'image') {
      // Close any open list
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      let imageUrl = '';
      if (block.asset && block.asset._ref) {
        // Convert Sanity asset reference to URL
        const ref = block.asset._ref;
        const [, id, dimensions, format] = ref.split('-');
        imageUrl = `https://cdn.sanity.io/images/bcqvqm54/production/${id}-${dimensions}.${format}`;
      }
      
      const alt = block.alt || '';
      const caption = block.caption || '';
      
      html += `
        <figure style="margin: 30px 0; text-align: center;">
          <img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
          ${caption ? `<figcaption style="margin-top: 10px; font-style: italic; color: #666; font-size: 0.9rem;">${caption}</figcaption>` : ''}
        </figure>
      `;
    }
    
    // Handle code blocks
    else if (block._type === 'code') {
      // Close any open list
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const language = block.language || 'text';
      const code = block.code || '';
      
      html += `
        <pre style="background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 25px 0; border-left: 4px solid #667eea;">
          <code class="language-${language}">${escapeHtml(code)}</code>
        </pre>
      `;
    }
    
    // Handle tables
    else if (block._type === 'table') {
      // Close any open list
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      if (block.rows && block.rows.length > 0) {
        html += '<table style="width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #ddd;">';
        
        block.rows.forEach((row, rowIndex) => {
          html += '<tr>';
          if (row.cells) {
            row.cells.forEach(cell => {
              const tag = rowIndex === 0 ? 'th' : 'td';
              const style = rowIndex === 0 ? 
                'style="background: #f8f9fa; padding: 12px; border: 1px solid #ddd; font-weight: bold;"' :
                'style="padding: 12px; border: 1px solid #ddd;"';
              html += `<${tag} ${style}>${cell || ''}</${tag}>`;
            });
          }
          html += '</tr>';
        });
        
        html += '</table>';
      }
    }
    
    // Handle custom blocks
    else if (block._type === 'youtube' || block._type === 'video') {
      // Close any open list
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const videoId = block.videoId || block.url;
      if (videoId) {
        html += `
          <div style="margin: 30px 0; text-align: center;">
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
              <iframe 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                src="https://www.youtube.com/embed/${videoId}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        `;
      }
    }
    
    // Handle AI Prompt blocks
    else if (block._type === 'aiPrompt') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="ai-prompt">
          <div class="block-icon">🤖</div>
          <div class="block-content">
            <div class="block-title">AI Prompt</div>
            ${content}
          </div>
        </div>
      `;
    }
    
    // Handle Code Block (different from inline code)
    else if (block._type === 'codeBlock') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const language = block.language || 'javascript';
      const code = block.code || '';
      html += `
        <div class="code-block" data-language="${language}">
          <pre><code>${escapeHtml(code)}</code></pre>
        </div>
      `;
    }
    
    // Handle Tip blocks
    else if (block._type === 'tip') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="tip">
          <div class="block-icon">💡</div>
          <div class="block-content">
            <div class="block-title">Tip</div>
            ${content}
          </div>
        </div>
      `;
    }
    
    // Handle Warning blocks
    else if (block._type === 'warning') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="warning">
          <div class="block-icon">⚠️</div>
          <div class="block-content">
            <div class="block-title">Warning</div>
            ${content}
          </div>
        </div>
      `;
    }
    
    // Handle Field Notes blocks
    else if (block._type === 'fieldNotes') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="field-notes">
          <div class="block-icon">📝</div>
          <div class="block-content">
            <div class="block-title">Field Notes</div>
            ${content}
          </div>
        </div>
      `;
    }
    
    // Handle Key Takeaways blocks
    else if (block._type === 'keyTakeaways') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="key-takeaways">
          <div class="block-icon">🎯</div>
          <div class="block-content">
            <div class="block-title">Key Takeaways</div>
            ${content}
          </div>
        </div>
      `;
    }
    
    // Handle Pro Tip blocks
    else if (block._type === 'proTip') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      
      const content = block.content ? blocksToHtml(block.content) : '';
      html += `
        <div class="pro-tip">
          <div class="block-icon">⭐</div>
          <div class="block-content">
            <div class="block-title">Pro Tip</div>
            ${content}
          </div>
        </div>
      `;
    }
  });
  
  // Close any remaining open list
  if (inList) {
    html += `</${listType}>`;
  }
  
  return html || '<p>No content available.</p>';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateBlogPostHTML(post) {
  const description = post.excerpt || extractFirstParagraph(post.body);
  let imageUrl = 'https://chrisspagnuolo.info/your-photo.jpg';
  
  if (post.mainImage && post.mainImage.asset && post.mainImage.asset._ref) {
    const ref = post.mainImage.asset._ref;
    const [, id, dimensions, format] = ref.split('-');
    imageUrl = `https://cdn.sanity.io/images/bcqvqm54/production/${id}-${dimensions}.${format}`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - Chris Spagnuolo</title>
    
    <!-- Open Graph meta tags -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Chris Spagnuolo">
    <meta property="og:url" content="https://chrisspagnuolo.info/blog/${post.slug.current}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@chrisspagnuolo">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Link to external stylesheet -->
    <link rel="stylesheet" href="/styles.css">
    
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-784EYD369G"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-784EYD369G');
</script>
</head>
<body>
    <header>
        <nav>
            <a href="/index.html" class="logo">Chris Spagnuolo</a>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul class="nav-links">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/resume.html">Experience</a></li>
                <li><a href="/testimonials.html">Testimonials</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/index.html#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="blog-main">
        <div class="blog-container">
            <div class="back-nav">
                <a href="/blog.html" class="back-link">
                    ← Back to Blog
                </a>
            </div>
            
            <article class="article-content">
                <div class="article-body">
                    <h1>${post.title}</h1>
${post.publishedAt ? `<div class="article-meta">${formatDate(post.publishedAt)}</div>` : ''}
${post.categories && post.categories.length > 0 ? 
  `<div class="post-categories-header">
    ${post.categories.map(cat => 
      `<a href="/category/${cat.slug.current}" class="post-category-tag">${cat.title}</a>`
    ).join('')}
  </div>` : ''
}
${post.excerpt ? `<div class="article-excerpt">${post.excerpt}</div>` : ''}
${blocksToHtml(post.body)}
                </div>
            </article>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Chris Spagnuolo. All rights reserved.</p>
        </div>
    </footer>

    <script src="/script.js"></script>
</body>
</html>`;
}

function generateErrorPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Chris Spagnuolo</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="/index.html" class="logo">Chris Spagnuolo</a>
            <ul class="nav-links">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/resume.html">Experience</a></li>
                <li><a href="/testimonials.html">Testimonials</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/index.html#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main style="padding: 200px 20px; text-align: center;">
        <h1>${message}</h1>
        <p><a href="/blog.html">Return to Blog</a></p>
    </main>
</body>
</html>`;
}
