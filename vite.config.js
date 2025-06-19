// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => ({
  root: mode === 'local' ? 'src' : '.',
  base: './',
  build: {
    outDir: mode === 'production' ? 'package/prd' : 'package/dev',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/sfiapdgen.html'),
      output: {
        entryFileNames: 'assets/sfiapdgen-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep JSON files with original names for easier loading
          if (assetInfo.name?.endsWith('.json')) {
            return '[name][extname]';
          }
          // Keep CSS files with recognizable names for theme toggle
          if (assetInfo.name?.includes('styles-light') || assetInfo.name?.includes('styles-dark')) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    assetsDir: 'assets',
  },
  server: {
    port: process.env.VITE_PORT || 5502,
    open: mode === 'local' ? '/sfiapdgen.html' : '/src/sfiapdgen.html',
  },
  plugins: [
    {
      name: 'copy-assets-and-move-html',
      generateBundle(options, bundle) {
        // Copy JSON files
        const jsonFiles = [
          'json_source_v7.json',
          'json_source_v8.json',
          'json_source_v9.json',
          'json-sfia-lors-v8.json'
        ];
        
        jsonFiles.forEach(file => {
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: fs.readFileSync(resolve('src', file))
          });
        });
        
        // Copy additional HTML files
        this.emitFile({
          type: 'asset',
          fileName: 'sfia-skills-table.html',
          source: fs.readFileSync(resolve('src', 'sfia-skills-table.html'))
        });
        
        // Copy CSS files with original names for theme toggle
        this.emitFile({
          type: 'asset',
          fileName: 'styles-light.css',
          source: fs.readFileSync(resolve('src', 'styles-light.css'))
        });
        
        this.emitFile({
          type: 'asset',
          fileName: 'styles-dark.css',
          source: fs.readFileSync(resolve('src', 'styles-dark.css'))
        });
      },
      writeBundle(options, bundle) {
        // Move the main HTML file from src/sfiapdgen.html to sfiapdgen.html
        const outDir = options.dir;
        const srcHtmlPath = resolve(outDir, 'src', 'sfiapdgen.html');
        const targetHtmlPath = resolve(outDir, 'sfiapdgen.html');
        
        if (fs.existsSync(srcHtmlPath)) {
          // Read the HTML content and update relative paths
          let htmlContent = fs.readFileSync(srcHtmlPath, 'utf-8');
          
          // Update relative paths from ../assets/ to ./assets/
          htmlContent = htmlContent.replace(/\.\.\/assets\//g, './assets/');
          // Update relative paths from ../styles- to ./styles-
          htmlContent = htmlContent.replace(/\.\.\/styles-/g, './styles-');
          
          // Write to target location
          fs.writeFileSync(targetHtmlPath, htmlContent);
          
          // Remove the src directory and its contents
          fs.rmSync(resolve(outDir, 'src'), { recursive: true, force: true });
        }
      }
    }
  ]
}));