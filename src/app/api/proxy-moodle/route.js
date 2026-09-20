export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "6";
    const courseId = searchParams.get("id") || "53";
    const session = searchParams.get("session");

    if (!session) {
      return new Response(
        "<html><body style='font-family:sans-serif;padding:40px;text-align:center;'><h2>Moodle Session Cookie Required</h2><p>Please enter your MoodleSession cookie in the app settings to load course content.</p></body></html>",
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const targetUrl = `https://www.mayanschool.net/moodlepkpri/course/view.php?id=${courseId}&section=${section}#tabs-tree-start`;

    const response = await fetch(targetUrl, {
      headers: {
        "Cookie": `MoodleSession=${session}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
    });

    let html = await response.text();

    // Strip out browser extension injections
    html = html.replace(/<x-extension-template[\s\S]*?<\/x-extension-template>/gi, '');
    html = html.replace(/<script[^>]*chrome-extension:\/\/[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<div[^>]*id="highlighter--hover-tools"[\s\S]*?<\/div>/gi, '');

    // Inject an auto-dismiss script to nuke Moodle yui-dialogue error popups instantly
    const autoDismissScript = `
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const observer = new MutationObserver(() => {
            document.querySelectorAll('.moodle-dialogue, .moodle-exception').forEach(el => {
              el.remove();
            });
            document.querySelectorAll('.yui3-widget-mask').forEach(mask => mask.remove());
          });
          observer.observe(document.body, { childList: true, subtree: true });
        });
      </script>
    `;
    html = html.replace("</body>", `${autoDismissScript}</body>`);

    // Fix relative assets so stylesheets and images load properly inside the proxy view
    html = html.replace(/src="\/pluginfile.php/g, 'src="https://www.mayanschool.net/moodlepkpri/pluginfile.php');
    html = html.replace(/href="\/theme/g, 'href="https://www.mayanschool.net/moodlepkpri/theme');
    html = html.replace(/src="\/lib/g, 'src="https://www.mayanschool.net/moodlepkpri/lib');

    const modifiedResponse = new Response(html, {
      status: response.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

    modifiedResponse.headers.delete("x-frame-options");
    modifiedResponse.headers.delete("content-security-policy");

    return modifiedResponse;
  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
