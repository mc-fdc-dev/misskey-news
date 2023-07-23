import Parser, { Item } from "rss-parser";
import { config } from "dotenv";
import Keyv from "keyv";

config();
let parser = new Parser();

var lastItems: string[] = [];
const keyv = new Keyv(process.env.DB);
const sleep = (waitTime: number) => new Promise( resolve => setTimeout(resolve, waitTime) );

async function check(): Promise<undefined> {
    let feed = await parser.parseURL('https://news.yahoo.co.jp/rss/topics/top-picks.xml');
    feed.items.forEach(async (item: Item) => {
        if (!await keyv.get(item.link as string)) {
            // console.log(item)
            await keyv.set(item.link as string, item.title);
            await fetch(
                `https://${process.env.MISSKEY}/api/notes/create`,
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
        await sleep(180);
    }
};

main();