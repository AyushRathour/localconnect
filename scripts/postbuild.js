import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distDir)) {
  // 1. Copy index.html to 404.html so GitHub Pages serves the SPA on all sub-routes
  const indexHtmlPath = path.join(distDir, 'index.html');
  const fallback404Path = path.join(distDir, '404.html');

  if (fs.existsSync(indexHtmlPath)) {
    fs.copyFileSync(indexHtmlPath, fallback404Path);
    console.log('[Postbuild] Created dist/404.html from dist/index.html for GitHub Pages routing.');
  }

  // 2. Create .nojekyll to disable Jekyll processing on GitHub Pages
  const noJekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(noJekyllPath, '');
  console.log('[Postbuild] Created dist/.nojekyll for GitHub Pages asset compatibility.');
} else {
  console.warn('[Postbuild] Warning: dist folder not found.');
}
