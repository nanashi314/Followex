d3.json("./graph.json")
  .then((data) => {
    console.log("=== Graph Visualization Started ===");
    console.log(`✓ Nodes loaded: ${data.nodes.length}`);
    console.log(`✓ Links loaded: ${data.links.length}`);
    
    if (!data.nodes || data.nodes.length === 0) {
      console.error("❌ No nodes data found!");
      document.body.innerHTML = "<h2>Error: No graph data found. Please run 'node index.js' first.</h2>";
      return;
    }

    // フォロワー数統計の計算
    const followerCounts = data.nodes.map(d => d.followers_count || 0);
    const maxFollowers = Math.max(...followerCounts);
    const minFollowers = Math.min(...followerCounts);
    const medianFollowers = d3.median(followerCounts);
    
    console.log(`✓ Follower statistics - Min: ${minFollowers}, Median: ${medianFollowers}, Max: ${maxFollowers}`);
    
    // 中央値を基準に低フォロワー層と高フォロワー層で異なるスケールを適用
    const sizeLowScale = d3.scalePow()
      .exponent(0.3)
      .domain([minFollowers, medianFollowers])
      .range([8, 25])
      .clamp(true);
      
    const sizeHighScale = d3.scalePow()
      .exponent(0.7)
      .domain([medianFollowers, maxFollowers])
      .range([25, 70])
      .clamp(true);
    
    const getNodeSize = (followers) => {
      return followers <= medianFollowers ? sizeLowScale(followers) : sizeHighScale(followers);
    };
    
    console.log(`✓ Node sizes - Min: ${getNodeSize(minFollowers)}px, Median: ${getNodeSize(medianFollowers)}px, Max: ${getNodeSize(maxFollowers)}px`);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([minFollowers, maxFollowers]);    // SVG要素の取得と設定
    const svg = d3.select("svg");
    
    if (!svg.node()) {
      console.error("❌ SVG element not found!");
      return;
    }
    
    const width = +svg.attr("width") || 800;
    const height = +svg.attr("height") || 600;
    console.log(`✓ Canvas dimensions: ${width} x ${height}`);

    svg.style("background-color", "#f0f0f0");

    const defs = svg.append("defs");
    const container = svg.append("g").attr("class", "main-container");

    // ズーム・パン機能の設定
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        
        // ズームレベルに応じてラベル表示を調整
        const zoomLevel = event.transform.k;
        if (typeof labels !== 'undefined') {
          labels.style("opacity", zoomLevel > 0.5 ? 1 : 0);
        }
      });

    svg.call(zoom);
    console.log("✓ Zoom and pan functionality enabled");    // 物理シミュレーションの設定
    const simulation = d3
      .forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links)
        .id((d) => d.id)
        .distance(80))
      .force("charge", d3.forceManyBody()
        .strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius((d) => getNodeSize(d.followers_count || 0) + 5))
      .alphaDecay(0.02)
      .velocityDecay(0.8);

    console.log(`✓ Physics simulation initialized with ${data.nodes.length} nodes and ${data.links.length} links`);

    // リンク（エッジ）の描画
    const link = container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-width", "1.5px")
      .style("stroke-opacity", 0.6);

    console.log(`✓ ${link.size()} links rendered`);    // ノードグループの作成（アバター画像と背景円で構成）
    const nodeGroup = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // ノード背景円の描画
    const node = nodeGroup
      .append("circle")
      .attr("class", "node")
      .attr("r", (d) => getNodeSize(d.followers_count || 0))
      .style("fill", (d) => colorScale(d.followers_count || 0))
      .style("stroke", "#333")
      .style("stroke-width", "2px");    // GitHubアバター画像の描画
    const avatars = nodeGroup
      .append("image")
      .attr("class", "avatar")
      .attr("width", (d) => getNodeSize(d.followers_count || 0) * 1.6)
      .attr("height", (d) => getNodeSize(d.followers_count || 0) * 1.6)
      .attr("x", (d) => -getNodeSize(d.followers_count || 0) * 0.8)
      .attr("y", (d) => -getNodeSize(d.followers_count || 0) * 0.8)
      .attr("href", (d) => `https://github.com/${d.id}.png?size=64`)
      .style("cursor", "pointer")
      .style("border-radius", "50%")
      .style("border", "2px solid #fff")
      .on("error", function(event, d) {
        console.warn(`Failed to load avatar for user: ${d.id}`);
        
        // デフォルトのSVGアバターに置き換え
        const size = getNodeSize(d.followers_count || 0) * 1.6;
        const defaultAvatar = `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='%23ccc'><circle cx='12' cy='12' r='12'/><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z' fill='white'/></svg>`;
        
        d3.select(this).attr("href", defaultAvatar);
      })
      .on("load", function(event, d) {
        console.log(`✓ Avatar loaded for user: ${d.id}`);
      });

    console.log(`✓ ${avatars.size()} avatar images created`);

    // ツールチップの設定
    nodeGroup.append("title")
      .text((d) => `${d.id}\nフォロワー: ${d.followers_count || 0}\nフォロー中: ${d.following_count || 0}`);    // ユーザー名ラベルの描画
    const labels = container
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif")
      .style("fill", "#333")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("font-weight", "bold");

    console.log("Labels created:", labels.size());

    // シミュレーション更新処理
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
      
      // ラベルの位置更新（ノードサイズに応じて調整）
      labels
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + getNodeSize(d.followers_count || 0) + 15);
    });

    console.log("Graph visualization complete!");
  })
  .catch((error) => {
    console.error("Error loading graph data:", error);
  });
