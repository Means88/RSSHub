import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/all/:v?',
    categories: ['shopping'],
    example: '/gustshop/all',
    parameters: {
        v: 'version',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['shop.koeitecmo.com/products/list'],
        },
    ],
    name: 'Gust Shop All Products',
    maintainers: ['Means88'],
    handler,
    url: 'shop.koeitecmo.com/GustProductItem/list',
};

async function handler() {
    const itemList = await getItemList();
    return {
        title: 'Gust Shop - All Products',
        link: 'https://shop.koeitecmo.com/products/list',
        icon: 'https://shop.koeitecmo.com/favicon.ico',
        logo: 'https://shop.koeitecmo.com/favicon.ico',
        image: 'https://shop.koeitecmo.com/assets/images/bnr/shop_bnr_ktspot.jpg',
        item: await Promise.all(
            itemList.map(async (item) => ({
                title: item.name,
                link: item.product_link,
                // hack, origin does not provide pubDate
                pubDate: new Date(1_724_189_309_879 + Number(item.product_id) * 60 * 1000).toUTCString(),
                description: await getItem(item.product_link),
                image: `https://shop.koeitecmo.com/upload/save_image/${item.file_name}`,
            }))
        ),
    };
}

async function getItemList() {
    const url = 'https://shop.koeitecmo.com/GustProductItem/list/1';
    try {
        const response = await ofetch(url, {
            method: 'POST',
            body: { orderby: 'new' },
        });
        return response.productList;
    } catch {
        return [];
    }
}

async function getItem(url: string) {
    const response = await ofetch(url);
    const $ = load(response);
    $('.sns-list').remove();
    $('.product-related').remove();
    $('.product-options').remove();
    $('.detail-header-right').remove();
    $('input').remove();
    const description = $('.product-description').html();
    const detailContents = $('.detail-contents')
        .toArray()
        .map((item) => $(item).html())
        .join('');
    return `${description}<br>${detailContents}`;
}
