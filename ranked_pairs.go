package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"sort"
)

type Edge struct {
	Source string  `json:"source"`
	Target string  `json:"target"`
	Weight float32 `json:"weight"`
}

// pathExists checks for a path from src to dst using DFS.
// The `visited` map is crucial: it tracks nodes visited in THIS traversal
// to avoid redundant checks and exponential complexity.
func pathExists(src, dst int, graph map[int][]int, visited map[int]bool) bool {
	// If we've reached the destination, a path exists.
	if src == dst {
		return true
	}

	// If we've already visited this node during this specific search, stop here.
	if visited[src] {
		return false
	}
	// Mark the current node as visited for this search.
	visited[src] = true

	// Recursively check all neighbors.
	for _, neighbor := range graph[src] {
		if pathExists(neighbor, dst, graph, visited) {
			return true // Path found through a neighbor.
		}
	}

	return false
}

func main() {
	var err error
	var edges []Edge

	filename := flag.String("file", "/tmp/dat", "Path to the JSON file containing edges")
	flag.Parse()

	dat, err := os.ReadFile(*filename)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	err = json.Unmarshal(dat, &edges)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return
	}
	fmt.Println("Number of Edges:", len(edges))

	// --- Candidate ID Mapping (Your original code, which is good) ---
	var ID = make(map[string]int)
	var IDReverse = make(map[int]string)
	nextID := 0
	for _, edge := range edges {
		if _, exists := ID[edge.Source]; !exists {
			ID[edge.Source] = nextID
			IDReverse[nextID] = edge.Source
			nextID++
		}
		if _, exists := ID[edge.Target]; !exists {
			ID[edge.Target] = nextID
			IDReverse[nextID] = edge.Target
			nextID++
		}
	}
	numCandidates := len(ID)
	fmt.Println("Number of Candidates:", numCandidates)


	// --- Lock Pairs (The Optimized Part) ---
	var graph = make(map[int][]int)
	var weightGraph = make(map[int]map[int]float32)
	// Assuming edges are pre-sorted by weight, which is a requirement for Tideman.
	for i, edge := range edges {
		_ = i
		targetID := ID[edge.Target]
		sourceID := ID[edge.Source]

		// For each edge, we create a FRESH visited map for the cycle check.
		visited := make(map[int]bool)

		// Check if locking this edge creates a cycle by seeing if the loser
		// can already reach the winner.
		if pathExists(targetID, sourceID, graph, visited) {
			// A path exists, so adding this edge would create a cycle. Skip it.
			continue
		}

		// Logging progress
		//if (i+1)%100 == 0 {
		//	fmt.Printf("Processing edge %d/%d: from %s to %s\n", i+1, len(edges), edge.Source, edge.Target)
		//}

		// No cycle, so lock the pair by adding the edge to the graph.
		graph[sourceID] = append(graph[sourceID], targetID)
		if weightGraph[sourceID] == nil {
			weightGraph[sourceID] = make(map[int]float32)
		}
		weightGraph[sourceID][targetID] = edge.Weight
	}

	fmt.Println("Graph construction complete. Generating DOT file...")

	// --- Output Generation (Your original code) ---
	f, err := os.OpenFile("ranked_pairs_graph.dot", os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer f.Close()

	// sort nodes by the number of outgoing edges (for cleaner output)
	type NodeCount struct {
		Node  int
		Count int
	}
	var nodeCounts []NodeCount
	for node, values := range graph {
		nodeCounts = append(nodeCounts, NodeCount{Node: node, Count: len(values)})
	}
	sort.Slice(nodeCounts, func(i, j int) bool {
		return nodeCounts[i].Count > nodeCounts[j].Count
	})
	top10 := make(map[int]bool)
	for i := 0; i < 10 && i < len(nodeCounts); i++ {
		top10[nodeCounts[i].Node] = true
	}
	isTop10 := func(node int) bool {
		_, exists := top10[node]
		return exists
	}

	fmt.Fprintln(f, "digraph G {")
	fmt.Fprintln(f, "  rankdir=TB;")
	fmt.Fprintln(f, "  node [shape=box, style=rounded];")
	for _, nc := range nodeCounts {
		node := nc.Node
		values := graph[node]
		if len(values) > 0 && isTop10(node) {
			//fmt.Fprintf(f, "  \"%s\" -> { ", IDReverse[node])
			for _, v := range values {
				if !isTop10(v) {
					continue
				}
				//fmt.Fprintf(f, "\"%s\" [label=\"%.2f%%\"]\n", IDReverse[v], weightGraph[node][v])
				fmt.Fprintf(f, "  \"%s\" -> \"%s\" [label=\"%.2f%%\"];\n", IDReverse[node], IDReverse[v], weightGraph[node][v])
			}
			//fmt.Fprintln(f, "};")
		}
	}
	fmt.Fprintln(f, "}")

	fmt.Println("DOT file 'ranked_pairs_graph.dot' created successfully.")
}
