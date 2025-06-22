/**
 * GitHub Followex - Data Collection Module
 * GitHubのフォロワー・フォロー関係を取得してグラフデータを生成するモジュール
 */

const graphlib = require("graphlib");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const graph = new graphlib.Graph({ directed: true });

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

const cache = new Map();
const processedUsers = new Set();
const userInfo = new Map();

/**
 * ユーザーの詳細情報を取得
 */
async function fetchUserInfo(username) {
  try {
    const cacheKey = `userinfo_${username}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const response = await githubApi.get(`/users/${username}`);
    const info = {
      followers_count: response.data.followers,
      following_count: response.data.following,
      public_repos: response.data.public_repos
    };
    
    cache.set(cacheKey, info);
    userInfo.set(username, info);
    return info;
    
  } catch (error) {
    console.error(`Error fetching user info for ${username}:`, error.message);
    
    const defaultInfo = { 
      followers_count: 0, 
      following_count: 0, 
      public_repos: 0 
    };
    userInfo.set(username, defaultInfo);
    return defaultInfo;
  }
}

/**
 * BFS（幅優先探索）でフォロワー・フォロー関係のグラフを構築
 */
async function buildGraph(username, depth = 0) {
  try {
    if (processedUsers.has(username)) {
      console.log(`Skipping already processed user: ${username}`);
      return;
    }
    
    console.log(`Processing user: ${username} (depth: ${depth})`);
    processedUsers.add(username);

    await fetchUserInfo(username);

    const followers = await fetchFollowers(username);
    const following = await fetchFollowing(username);

    graph.setNode(username);
    followers.forEach((follower) => {
      graph.setNode(follower);
      graph.setEdge(follower, username);
    });
    following.forEach((followed) => {
      graph.setNode(followed);
      graph.setEdge(username, followed);
    });

    console.log(`Added ${followers.length} followers and ${following.length} following for ${username}`);

    // 深度制限で探索範囲を制御
    const MAX_DEPTH = 2;
    if (depth < MAX_DEPTH) {
      // パフォーマンスのため各10人まで
      for (const follower of followers.slice(0, 10)) {
        await buildGraph(follower, depth + 1);
      }
      
      for (const followed of following.slice(0, 10)) {
        await buildGraph(followed, depth + 1);
      }
    }
    
  } catch (error) {
    console.error(`Error building graph for ${username}:`, error.message);
  }
}

async function fetchFollowers(username) {
  try {
    const cacheKey = `followers_${username}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const response = await githubApi.get(`/users/${username}/followers`);
    const followers = response.data.map((user) => user.login);
    
    cache.set(cacheKey, followers);
    console.log(`Fetched ${followers.length} followers for ${username}`);
    return followers;
    
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error.message);
    return [];
  }
}

async function fetchFollowing(username) {
  try {
    const cacheKey = `following_${username}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const response = await githubApi.get(`/users/${username}/following`);
    const following = response.data.map((user) => user.login);
    
    cache.set(cacheKey, following);
    console.log(`Fetched ${following.length} following for ${username}`);
    return following;
    
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error.message);
    return [];
  }
}

// メイン処理
(async () => {
  try {
    console.log("=== GitHub Followex Data Collection Started ===");
    
    // 起点となるユーザー名を変更する場合はここを編集
    const rootUsername = "nanashi314";
    console.log(`Building network graph starting from user: ${rootUsername}`);
    
    await buildGraph(rootUsername);

    // グラフデータをJSON形式にフォーマット
    const nodes = graph.nodes().map((id) => {
      const info = userInfo.get(id) || { 
        followers_count: 0, 
        following_count: 0, 
        public_repos: 0 
      };
      
      return { 
        id, 
        followers_count: info.followers_count,
        following_count: info.following_count,
        public_repos: info.public_repos
      };
    });
    
    const links = graph.edges().map(({ v, w }) => ({
      source: v, 
      target: w 
    }));

    const graphData = { nodes, links };
    
    fs.writeFileSync("graph.json", JSON.stringify(graphData, null, 2));

    console.log("=== Data Collection Complete ===");
    console.log(`✓ Graph data saved to graph.json`);
    console.log(`✓ Total nodes (users): ${nodes.length}`);
    console.log(`✓ Total links (connections): ${links.length}`);
    console.log(`✓ Processed ${processedUsers.size} unique users`);
    console.log(`✓ Cache entries: ${cache.size}`);
    
    // フォロワー数の統計
    const followerCounts = nodes.map(n => n.followers_count);
    const maxFollowers = Math.max(...followerCounts);
    const minFollowers = Math.min(...followerCounts);
    const avgFollowers = Math.round(followerCounts.reduce((a, b) => a + b, 0) / followerCounts.length);
    
    console.log("=== Network Statistics ===");
    console.log(`✓ Followers range: ${minFollowers} - ${maxFollowers}`);
    console.log(`✓ Average followers: ${avgFollowers}`);
    console.log("\nNext step: Open index.html in your browser to visualize the network!");
    
  } catch (error) {
    console.error("=== Error in main process ===", error);
    process.exit(1);
  }
})();
