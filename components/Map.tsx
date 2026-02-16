"use client";

import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

interface MapProps {
  center?: [number, number]; // Latitude, Longitude
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
  }>;
}

const Map = ({
  center = [-34.6037, -58.3816], // Buenos Aires default
  zoom = 13,
  markers = [],
}: MapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-100 rounded-xl text-slate-500">
        <p>Google Maps API Key not configured</p>
      </div>
    );
  }

  // Convert center array to object
  const centerObj = { lat: center[0], lng: center[1] };

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <div
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        <GoogleMap
          defaultCenter={centerObj}
          defaultZoom={zoom}
          mapId={"DEMO_MAP_ID"} // You might want to create a Map ID in Google Cloud Console for advanced markers
          disableDefaultUI={false}
          style={{ width: "100%", height: "100%" }}
        >
          {markers.map((marker, index) => (
            <AdvancedMarker
              key={index}
              position={{ lat: marker.position[0], lng: marker.position[1] }}
              title={marker.title}
            >
              <Pin
                background={"#EA4335"}
                borderColor={"#C5221F"}
                glyphColor={"#B31412"}
              />
            </AdvancedMarker>
          ))}
        </GoogleMap>
      </div>
    </APIProvider>
  );
};

export default Map;
