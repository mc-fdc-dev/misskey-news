import Parser, { Item } from "rss-parser";
import { config } from "dotenv";

config();
let parser = new Parser();

var lastItems: string[] = [];

async function check(): Promise<undefined> {
    let feed = await parser.parseURL('https://news.yahoo.co.jp/rss/topics/top-picks.xml');
    feed.items.forEach(async (item: Item) => {
        if (!lastItems.includes(item.link as string)) {
            console.log(item)
            lastItems.push(item.link as string);
            await fetch(
                "https://social.tuna2134.dev/api/notes/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        i: process.env.TOKEN,
                        text: `${item.title}\n\n${item.link}`,
                    })
                }
            )
        }
    });
};

async function main() {
    while (true) {
        await check();
    }
};

main();