function modToName(mod, platform) {
    const platformVersion = platform.length > 0 ? mod.gd[platform] : "";
    return `<a href="https://geode-sdk.org/mods/${mod.id}">${mod.name} by ${mod.developers.find(x => x.is_owner).display_name}`
    + (platformVersion.length > 0 ? ` (GD ${platformVersion}, Geode ${mod.geode})</a>` : ` (Geode ${mod.geode})</a>`);
}

function convertGD(gd, version) {
    return {
        win: gd.win == version || gd.win == "*" || version == null ? gd.win : null,
        android32: gd.android32 == version || gd.android32 == "*" || version == null ? gd.android32 : null,
        android64: gd.android64 == version || gd.android64 == "*" || version == null ? gd.android64 : null,
        "mac-intel": gd["mac-intel"] == version || gd["mac-intel"] == "*" || version == null ? gd["mac-intel"] : null,
        "mac-arm": gd["mac-arm"] == version || gd["mac-arm"] == "*" || version == null ? gd["mac-arm"] : null,
        ios: gd.ios == version || gd.ios == "*" || version == null ? gd.ios : null,
    }
}

function responseToMod(response, gd) {
    return {
        id: response.id,
        name: response.versions[0].name,
        description: response.versions[0].description,
        developers: response.developers,
        gd: convertGD(response.versions[0].gd, gd),
        geode: response.versions[0].geode,
        downloads: response.download_count,
        latestDownloads: response.versions[0].download_count,
        version: response.versions[0].version,
        featured: response.featured,
        hash: response.versions[0].hash
    }
}

async function getMods(gd, geode) {
    const modsKey = `mods-${gd}-${geode}`
    if (sessionStorage && sessionStorage.getItem(modsKey)) return JSON.parse(sessionStorage.getItem(modsKey));

    const mods = [];

    const baseURL = `https://api.geode-sdk.org/v1/mods?per_page=100${gd != null ? `&gd=${gd}` : ""}${geode != null ? `&geode=${geode}` : ""}`;
    const page1 = await fetch(baseURL).then(r => r.json());
    mods.push(...page1.payload.data.map(res => responseToMod(res, gd)));
    const maxPage = Math.ceil(page1.payload.count / 100);
    for (let i = 2; i <= maxPage; i++) {
        const page = await fetch(`${baseURL}&page=${i}`).then(r => r.json());
        mods.push(...page.payload.data.map(res => responseToMod(res, gd)));
    }

    if (sessionStorage) sessionStorage.setItem(modsKey, JSON.stringify(mods));

    return mods;
}

async function getDevelopers() {
    if (sessionStorage && sessionStorage.getItem("developers")) return JSON.parse(sessionStorage.getItem("developers"));

    const developers = [];

    const baseURL = "https://api.geode-sdk.org/v1/developers?per_page=100";
    const page1 = await fetch(baseURL).then(r => r.json());
    developers.push(...page1.payload.data);
    const maxPage = Math.ceil(page1.payload.count / 100);
    for (let i = 2; i <= maxPage; i++) {
        const page = await fetch(`${baseURL}&page=${i}`).then(r => r.json());
        developers.push(...page.payload.data);
    }

    if (sessionStorage) sessionStorage.setItem("developers", JSON.stringify(developers));

    return developers;
}

function goToPage(page) {
    const url = new URL(window.location.origin + page);
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
        url.searchParams.set(key, value);
    }
    window.location.assign(url);
}
