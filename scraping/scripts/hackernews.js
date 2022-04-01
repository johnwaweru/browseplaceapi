// import helpers
const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    try {
        // wait for 1 second
        page.waitForTimeout(1000);
        await page.goto(
            "https://hn.algolia.com/?dateRange=all&page=0&prefix=true&query=%22youtu.be%22&sort=byDate&type=all"
        );

        // wait until the page is loaded
        await page.waitForSelector(".Story");

        // check if page has any urls matching youtu.be or youtube.com
        const urls = await page.evaluate(() => {
            const urls = Array.from(document.querySelectorAll("a")).map(
                (a) => a.href
            );
            return urls.filter((url) =>
                url.match(/^https?:\/\/(www\.)?(youtu\.be|youtube\.com)/)
            );
        });

        // get each .Story element that has a url matching youtu.be or youtube.com
        const stories = await page.evaluate(() => {
            const stories = Array.from(document.querySelectorAll(".Story")).map(
                (story) => {
                    const title =
                        story.querySelector(".Story-title")?.innerText;
                    const url = story.querySelector(".Story-title a")?.href;
                    const points =
                        story.querySelector(".Story-points")?.innerText;
                    const comments =
                        story.querySelector(".Story-comments")?.innerText;
                    return { title, url, points, comments };
                }
            );
            return stories;
        });

        // log each matched url out
        for (const url of urls) {
            console.log(url);
        }
    } catch (e) {
        console.log("Error caught HERE!!!!!!!!!!!");
        console.log(e);
    }

    await browser.close();
})();
