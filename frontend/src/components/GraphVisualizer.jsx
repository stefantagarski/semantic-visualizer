import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ graphData }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!graphData) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        const nodes = graphData.nodes.map(id => ({ id }));
        const links = graphData.edges.map(edge => ({
            source: edge.subject,
            target: edge.object,
            label: edge.predicate
        }));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-width", 2);

        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 8)
            .attr("fill", "#2e8783")
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

        const label = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .text(d => d.id.split("#").pop())
            .attr("x", 12)
            .attr("y", ".31em")
            .attr("font-size", 12);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y);
        });

    }, [graphData]);

    return <svg ref={svgRef} width="100%" height="100vh" />;
};

export default GraphVisualizer;
