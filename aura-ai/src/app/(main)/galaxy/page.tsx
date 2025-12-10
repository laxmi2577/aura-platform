import GalaxyScene from "@/components/features/galaxy/GalaxyScene"

/**
 * 3D Galaxy Visualization route.
 * Renders the immersive WebGL scene for navigating sound clusters.
 */
export default function GalaxyPage() {
  return (
    <div className="h-full w-full p-0">
      <GalaxyScene />
    </div>
  )
}