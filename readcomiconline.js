// Venera Source: ReadComicsOnline
// Converted from Miru format

class ReadComicsOnline extends ComicSource {
  constructor() {
    super({
      name: 'ReadComicsOnline',
      version: '1.0.0',
      description: 'Comics from readcomicsonline.ru',
      baseUrl: 'https://readcomicsonline.ru',
      icon: 'https://readcomicsonline.ru/images/banner.jpg',
      lang: 'en',
    });
  }

  async search(keyword) {
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(keyword)}`;
    const res = await this.request(url);
    const json = await res.json();

    return json.suggestions.map((item) => ({
      title: item.value,
      url: `${this.baseUrl}/comic/${item.data}`,
      cover: `${this.baseUrl}/uploads/manga/${item.data}/cover/cover_250x350.jpg`,
    }));
  }

  async explore(page) {
    const res = await this.request(`${this.baseUrl}/`);
    const doc = this.parseHtml(res);
    const items = [...doc.querySelectorAll('div.row > div.col-sm-6')];

    return items.map((el) => {
      const a = el.querySelector('h5 > a');
      const img = el.querySelector('img');
      return {
        title: a.textContent.trim(),
        url: a.getAttribute('href'),
        cover: 'https:' + img.getAttribute('src'),
      };
    });
  }

  async load(url) {
    const res = await this.request(url);
    const doc = this.parseHtml(res);

    const title = doc.querySelector('h2')?.textContent.trim() || 'Untitled';
    const cover = 'https:' + doc.querySelector('img.img-responsive')?.getAttribute('src');
    const desc = doc.querySelector('div.manga.well > p')?.textContent.trim() || '';

    const episodes = [...doc.querySelectorAll('ul.chapters > li')].map((li) => {
      const a = li.querySelector('h5 > a');
      return {
        name: a.textContent.trim(),
        url: a.getAttribute('href'),
      };
    }).reverse(); // reverse order for ascending chapters

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: 'Chapters',
          urls: episodes,
        },
      ],
    };
  }

  async loadComicPages(url) {
    const res = await this.request(url);
    const doc = this.parseHtml(res);
    const images = [...doc.querySelectorAll('div#all > img')]
      .map((img) => img.getAttribute('data-src')?.trim())
      .filter(Boolean);

    return images;
  }
}

registerComicSource(ReadComicsOnline);
