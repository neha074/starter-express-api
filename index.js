const http = require('http');
const https= require('https');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/lateststories') {
    // Replace the URL with the one you want to scrape
    const htmlUrl = 'https://time.com';

    https.get(htmlUrl, (htmlResponse) => {
      let htmlData = '';

      htmlResponse.on('data', (chunk) => {
        htmlData += chunk;
      });

      htmlResponse.on('end', () => {
        const matches = htmlData.match(/<div class="partial latest-stories" data-module_name="Latest Stories">(.*?)<\/div>/s);

        if (matches && matches.length >= 2) {
          const extractedHTML = matches[1];

          const linksAndHeadings = extractLinksAndHeadings(extractedHTML);

          const data =  linksAndHeadings

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Section not found');
        }
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
function extractLinksAndHeadings(html) {
    const linksAndHeadings = [];
    const linkRegex = /<a[^>]*>\n\s*.*?\n\s*<\/a>/g;   
    const h3Regex = /<h3[^>]*>(.*?)<\/h3>/g;
    let linkMatches = html.matchAll(linkRegex);

    let h3Matches = html.matchAll(h3Regex);

    const matchesArray = Array.from(h3Matches, match => match[1]);
    for (const linkMatch of linkMatches) {
        const hrefValue = extractHref(linkMatch[0]);
      const link = hrefValue;
      const text = h3Matches[1];
      linksAndHeadings.push({ link, text });
    }
    const linksAndHeadingsArray=linksAndHeadings.map((r,idx)=>{
        let subObj={
            title:matchesArray[idx],
            link:"https://time.com/"+r.link,
        }
        return subObj
    })
    return linksAndHeadingsArray;
  }

  function extractHref(html) {
    const openTagIndex = html.indexOf('<a');
    const closeTagIndex = html.indexOf('</a>');
  
    if (openTagIndex !== -1 && closeTagIndex !== -1) {
      const aTagContent = html.slice(openTagIndex, closeTagIndex + 4);
      const hrefMatch = aTagContent.match(/href="([^"]+)"/);
  
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
    }
  
    return null;
  }
const port = 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
