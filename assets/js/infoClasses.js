/**
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */
class Info {
  constructor(container) {
    this.container = container;
  }

  async fetch() {
    const res = await fetch(this.url);
    this.list = this.transform(await res.json());
  }

  insert() {
    const figure = document.createElement('figure');
    const figcaption = document.createElement('figcaption');
    const ul = document.createElement('ul');
    figcaption.append(document.createTextNode(this.title));
    figure.append(figcaption);
    ul.innerHTML = this.list.reduce((acc, val) => `${acc}<li>${val}</li>`);
    figure.append(ul);
    this.container.append(figure);
  }
}

export class GitHubInfo extends Info {
  constructor(container, userName, repoNumber) {
    super(container);
    const userReposUrl = `https://api.github.com/users/${userName}/repos`;
    this.url = `${userReposUrl}?per_page=${repoNumber}&page=1&sort=updated`;
    this.title = 'GITHUB REPOS';
  }

  transform(data) {
    return data.map(item => item.name);
  }
}

export class NpmInfo extends Info {
  constructor(container, userName, pkgNumber) {
    super(container);
    const searchUlr = 'https://registry.npmjs.org/-/v1/search';
    this.url = `${searchUlr}?text=author:${userName}&size=${pkgNumber}`;
    this.title = 'NPM PACKAGES';
  }

  transform(data) {
    return data.objects.map(item => `${item.package.name} v${item.package.version}`);
  }
}
