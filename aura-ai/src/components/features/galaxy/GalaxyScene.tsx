"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePlayerStore } from "@/store/playerStore"
import * as THREE from "three"
import { MousePointer2, Move, ZoomIn } from "lucide-react"
import { toast } from "sonner"

const CLUSTER_COLORS = ["#ff5252", "#448aff", "#69f0ae", "#e040fb", "#ffd740"]

function SoundStar({ data, onClick }: { data: any, onClick: () => void }) {
  const mesh = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.2
      mesh.current.rotation.y += delta * 0.2
    }
  })

  const color = CLUSTER_COLORS[data.cluster_label % CLUSTER_COLORS.length] || "white"

  return (
    <group position={[data.x_axis, data.y_axis, data.z_axis]}>
      <mesh
        ref={mesh}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[hovered ? 1.5 : 0.8, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? "white" : color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={15}>
          <div className="pointer-events-none flex flex-col items-center">
            <div className="bg-zinc-900/90 text-white text-xs font-bold px-3 py-2 rounded-md border border-white/20 shadow-xl backdrop-blur-md whitespace-nowrap animate-in zoom-in-95">
              {data.title}
              <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                Vibe Cluster {data.cluster_label}
              </span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20" />
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * 3D Semantic Galaxy Visualization.
 * Renders a Three.js scene displaying soundscap embeddings as spatial nodes.
 * Optimized to fetch lightweight metadata first, loading audio assets on-demand upon interaction.
 */
export default function GalaxyScene() {
  const [nodes, setNodes] = useState<any[]>([])
  const { setTrack } = usePlayerStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fetch only spatial coordinates and labels for scene construction (excludes heavy payloads)
      const { data } = await supabase
        .from("sounds")
        .select("id, title, x_axis, y_axis, z_axis, cluster_label")
        .not("x_axis", "is", null)

      setNodes(data || [])
    }
    fetchData()
  }, [])

  const handleNodeClick = async (node: any) => {
    try {
      toast.loading(`Loading "${node.title}"...`, { id: "galaxy-load" })

      const { data, error } = await supabase
        .from("sounds")
        .select("file_url")
        .eq("id", node.id)
        .single()

      if (error || !data) throw new Error("Could not load audio")

      setTrack({
        id: node.id,
        title: node.title,
        file_url: data.file_url,
        category: "Galaxy"
      })

      toast.dismiss("galaxy-load")
    } catch (e) {
      toast.error("Failed to load sound", { id: "galaxy-load" })
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-black relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-white font-bold text-2xl tracking-tight drop-shadow-md">Vibe Galaxy</h2>
        <p className="text-zinc-400 text-sm">AI-clustered soundscape visualization.</p>

        <div className="mt-3 flex gap-3 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/5 w-fit">
          {CLUSTER_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}` }}></div>
              <span className="text-[10px] text-zinc-400 font-mono">V{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-xs text-zinc-300 shadow-xl space-y-2">
          <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-[10px] opacity-70">Controls</h3>
          <div className="flex items-center gap-3">
            <MousePointer2 className="w-4 h-4 text-white" />
            <span><strong>Left Click</strong> to Rotate</span>
          </div>
          <div className="flex items-center gap-3">
            <Move className="w-4 h-4 text-white" />
            <span><strong>Right Click</strong> to Pan</span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-white" />
            <span><strong>Scroll</strong> to Zoom</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 80], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />

        {nodes.map((node) => (
          <SoundStar
            key={node.id}
            data={node}
            onClick={() => handleNodeClick(node)}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={200}
          minDistance={10}
        />
      </Canvas>
    </div>
  )
}