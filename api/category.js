// Create this file: api/category.js
export default async function handler(req, res) {
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Category slug is required' });
  }

  try {
    const PROJECT_ID = 'bcqvqm54';
    const DATASET = 'production';
    
    // First get the category info
    const categoryQuery = `*[_type == "category" && slug.current == "${slug}"][0] {
      title,
      slug,
      description
    }`;
    
    // Then get posts for this category
    const postsQuery = `*[_type == "post" && references(*[_type=="category" && slug.current=="${slug}"]._id) && defined(publishedAt)] | order(publishedAt desc) {
      title,
      slug,
      excerpt,
      publishedAt,
      categories[]->{title, slug}
    }`;
    
    const encodedCategoryQuery = encodeURIComponent(categoryQuery);
    const encodedPostsQuery = encodeURIComponent(postsQuery);
    
    const categoryUrl = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodedCategoryQuery}`;
    const postsUrl = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodedPostsQuery}`;
    
    const [categoryResponse, postsResponse] = await Promise.all([
      fetch(categoryUrl),
      fetch(postsUrl)
    ]);
    
    if (!categoryResponse.ok || !postsResponse.ok) {
      throw new Error('Failed to fetch data from Sanity');
    }
    
    const categoryData = await categoryResponse.json();
    const postsData = await postsResponse.json();
    
    const category = categoryData.result;
    const posts = postsData.result;
    
    if (!category) {
      return res.status(404).send(generateErrorPage('Category not found'));
    }

    const html = generateCategoryPageHTML(category, posts);
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error loading category page:', error);
    res.status(500).send(generateErrorPage('Failed to load category page'));
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateCategoryPageHTML(category, posts) {
  const postsCount = posts.length;
  const postsText = postsCount === 1 ? 'article' : 'articles';
  
  const postsHTML = posts.length > 0 ? posts.map(post => `
    <article class="content-card">
      <div class="content-type">
        ${post.categories && post.categories.length > 0 ? 
          `<a href="/category/${post.categories[0].slug.current}" class="category-link">${post.categories[0].title.toUpperCase()}</a>` : 
          'ARTICLE'
        }
      </div>
      <div class="content-body">
        <h3><a href="/blog/${post.slug.current}">${post.title}</a></h3>
        <p class="muted" style="color:#666; margin:.25rem 0 0.6rem; font-size: 0.9rem;">
          ${formatDate(post.publishedAt)}
        </p>
        <p>${post.excerpt || extractText(post.body) || 'No excerpt available.'}</p>
        <p style="margin-top:.6rem;">
          <a href="/blog/${post.slug.current}">Read the full article</a>
        </p>
      </div>
    </article>
  `).join('') : '<p style="text-align: center; color: #666; font-size: 1.1rem;">No articles found in this category yet.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${category.title} Articles - Chris Spagnuolo</title>
    
    <!-- Open Graph meta tags -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Chris Spagnuolo">
    <meta property="og:url" content="https://chrisspagnuolo.info/category/${category.slug.current}">
    <meta property="og:title" content="${category.title} Articles - Chris Spagnuolo">
    <meta property="og:description" content="${category.description || `${postsCount} ${postsText} about ${category.title.toLowerCase()}`}">
    <meta property="og:image" content="https://chrisspagnuolo.info/your-photo.jpg">
    
    <link rel="stylesheet" href="/styles.css">
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

    <section class="category-hero">
        <div class="container">
            <h1 class="category-title">${category.title}</h1>
            ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
            <p class="posts-count">${postsCount} ${postsText}</p>
        </div>
    </section>

    <main class="main-content">
        <section class="section">
            <div class="container">
                <div style="margin-bottom: 2rem;">
                    <a href="/blog.html" style="color: #667eea; text-decoration: none; font-weight: 500;">← Back to All Articles</a>
                </div>
                
                <div class="thought-leadership-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));">
                    ${postsHTML}
                </div>
            </div>
        </section>
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