const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100, // Uncomment to visualize test
    });
    const page = await browser.newPage();

    // Load "https://hn.algolia.com/?dateEnd=1199145600&dateRange=custom&dateStart=1167609600&page=0&prefix=true&query=%22youtube.com%22&sort=byDate&type=all"
    await page.goto(
        "https://hn.algolia.com/?dateEnd=1199145600&dateRange=custom&dateStart=1167609600&page=0&prefix=true&query=%22youtube.com%22&sort=byDate&type=all"
    );

    // Resize window to 1600 x 804
    await page.setViewport({ width: 1600, height: 804 });

    // Click on <label> "Jan 1st 2007 Jan 1st 2008"
    await page.waitForSelector("#downshift-2-label");
    await page.click("#downshift-2-label");

    // Click on <button> "Custom range" and await navigation
    await page.waitForSelector("#downshift-2-item-5 > button");
    await Promise.all([
        page.click("#downshift-2-item-5 > button"),
        page.waitForNavigation(),
    ]);

    // Click on <input> #from
    await page.waitForSelector("#from");
    await page.click("#from");

    // Fill "2007-01-01" on <input> #from
    await page.waitForSelector("#from:not([disabled])");
    await page.type("#from", "2007");

    // Click on <input> #to
    await page.waitForSelector("#to");
    await page.click("#to");

    // Fill "2008-01-01" on <input> #to
    await page.waitForSelector("#to:not([disabled])");
    await page.type("#to", "2008");

    // Click on <button> "Apply"
    await page.waitForSelector("button:nth-child(2)");
    await page.click("button:nth-child(2)");

    // Wait for 10 seconds and log out each second
    await page.waitForTimeout(1000);

    // await page.waitForSelector(".Pagination_item:nth-child(2) > button");
    await page.waitForSelector(".Pagination_item");
    // get number of .Pagination_item and go to next
    var currentPageNumber = 1;

    var morePaginationExists = true;

    try {
        while (morePaginationExists) {
            // do something
            console.log("morePaginationExists", morePaginationExists);

            var nextPageNumber = parseInt(currentPageNumber) + 1;
            console.log("nextPageNumber", nextPageNumber);

            // check if there is a .Pagination_item that contains text nextPageNumber
            var nextPageExists = await page.evaluate((nextPageNumber) => {
                var nextPageExists = Array.from(
                    document.querySelectorAll(".Pagination_item")
                ).some((item) => item.innerText === nextPageNumber.toString());
                return nextPageExists;
            }, nextPageNumber);

            console.log("nextPageExists", nextPageExists);

            if (!nextPageExists) {
                morePaginationExists = false;
            } else {
                try {
                    // click on .Pagination_item if it contains innerText of nextPageNumber
                    await clickOnNextLink(page, nextPageNumber);
                } catch (e) {
                    console.log("e", e);
                    console.log("trying again");
                    try {
                        // reload page and try again one more time before exiting
                        await page.reload();
                        await clickOnNextLink(page, nextPageNumber);
                    } catch (e) {
                        console.log("e", e);
                        // morePaginationExists = false;
                        currentPageNumber++;
                        continue;
                    }
                }
            }

            currentPageNumber++;
        }
    } catch (e) {
        // retry the same and if it fails again, throw the error. Otherwise, continue from current page
        console.log("error", e);
    }

    // wait 10 seconds
    await page.waitForTimeout(10000);

    await browser.close();
})();
async function clickOnNextLink(page, nextPageNumber) {
    await page.waitForSelector(".Pagination_item");
    await page.waitForSelector(
        ".Pagination_item:nth-child(" + nextPageNumber + ") > button"
    );
    await page.click(
        ".Pagination_item:nth-child(" + nextPageNumber + ") > button"
    );
    await page.waitForNavigation();
    await page.waitForTimeout(5000);
}
