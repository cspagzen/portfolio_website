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
      body
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
  
  blocks.forEach(block => {
    if (block._type === 'block' && block.children) {
      const style = block.style || 'normal';
      
      const text = block.children
        .map(child => {
          if (child._type === 'span') {
            let content = child.text || '';
            
            if (child.marks && child.marks.length > 0) {
              child.marks.forEach(mark => {
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
                    content = `<s>${content}</s>`;
                    break;
                  case 'code':
                    content = `<code>${content}</code>`;
                    break;
                }
              });
            }
            
            return content;
          }
          return '';
        })
        .join('');
      
      if (text.trim()) {
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
  });
  
  return html || '<p>No content available.</p>';
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
  const currentUrl = `https://chrisspagnuolo.info/blog/${post.slug.current}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - Chris Spagnuolo</title>
    
    <!-- Open Graph meta tags for social media previews -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Chris Spagnuolo">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://chrisspagnuolo.info/your-photo.jpg">
    
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@chrisspagnuolo">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://chrisspagnuolo.info/your-photo.jpg">
    
    <link rel="stylesheet" href="/styles.css">
    <style>
        .blog-main {
            padding-top: 100px;
            background: white;
            min-height: 100vh;
        }
        
        .blog-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px 80px;
        }
        
        .back-nav {
            margin-bottom: 40px;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            padding: 12px 20px;
            border: 2px solid rgba(102, 126, 234, 0.2);
            border-radius: 30px;
            transition: all 0.3s ease;
            font-size: 0.95rem;
        }
        
        .back-link:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .article-content {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .article-body {
            padding: 50px 60px;
        }
        
        .article-body h1 {
            font-size: 2.8rem;
            font-weight: 800;
            color: #333;
            line-height: 1.2;
            margin-bottom: 20px;
        }
        
        .article-meta {
            color: #667eea;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #f8f9fa;
        }
        
        .post-categories-header {
            margin: 20px 0 30px;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .post-category-tag {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }
        
        .post-category-tag:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .article-excerpt {
            font-size: 1.3rem;
            color: #667eea;
            font-style: italic;
            line-height: 1.6;
            margin-bottom: 40px;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
            border-radius: 15px;
            border-left: 6px solid #667eea;
        }
        
        .article-body h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #667eea;
            margin: 40px 0 20px;
            line-height: 1.3;
        }
        
        .article-body h3 {
            font-size: 1.4rem;
            font-weight: 600;
            color: #764ba2;
            margin: 35px 0 15px;
            line-height: 1.3;
        }
        
        .article-body h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin: 30px 0 12px;
            line-height: 1.3;
        }
        
        .article-body h5 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #555;
            margin: 25px 0 10px;
            line-height: 1.3;
        }
        
        .article-body h6 {
            font-size: 1rem;
            font-weight: 600;
            color: #666;
            margin: 20px 0 8px;
            line-height: 1.3;
        }
        
        .article-body p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #444;
            margin-bottom: 25px;
        }
        
        .article-body ul, .article-body ol {
            margin: 25px 0;
            padding-left: 30px;
        }
        
        .article-body li {
            font-size: 1.1rem;
            line-height: 1.7;
            color: #444;
            margin-bottom: 12px;
        }
        
        .article-body blockquote {
            border-left: 6px solid #667eea;
            padding: 25px 30px;
            margin: 35px 0;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
            font-style: italic;
            color: #555;
            border-radius: 0 15px 15px 0;
            font-size: 1.15rem;
            line-height: 1.7;
        }
        
        .article-body strong {
            font-weight: 700;
            color: #333;
        }
        
        .article-body em {
            font-style: italic;
            color: #667eea;
        }
        
        .article-body code {
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            color: #764ba2;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .blog-main {
                padding-top: 80px;
            }
            
            .blog-container {
                padding: 20px 15px 60px;
            }
            
            .article-body {
                padding: 30px 25px;
            }
            
            .article-body h1 {
                font-size: 2.2rem;
            }
            
            .article-body h2 {
                font-size: 1.6rem;
            }
            
            .article-body h3 {
                font-size: 1.3rem;
            }
            
            .article-excerpt {
                font-size: 1.1rem;
                padding: 20px;
            }
            
            .article-body p,
            .article-body li {
                font-size: 1rem;
            }
        }
    </style>
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