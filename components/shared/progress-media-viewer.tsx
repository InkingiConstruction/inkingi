import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants/colors";

export type ProgressMedia = {
  url: string;
  isVideo?: boolean;
  title?: string;
  caption?: string | null;
};

export function ProgressMediaViewer({
  media,
  onClose,
}: {
  media: ProgressMedia | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const player = useVideoPlayer(media?.isVideo ? media.url : null, (instance) => {
    instance.loop = false;
  });

  const zoomIn = () => setZoom((current) => Math.min(current + 0.25, 3));
  const zoomOut = () => setZoom((current) => Math.max(current - 0.25, 1));
  const resetZoom = () => setZoom(1);

  return (
    <Modal visible={Boolean(media)} animationType="fade" transparent>
      <View style={{ backgroundColor: "rgba(15, 23, 42, 0.96)", flex: 1 }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: COLORS.TEXT_WHITE, fontSize: 16, fontWeight: "900" }}>
              {media?.title || (media?.isVideo ? "Progress video" : "Progress photo")}
            </Text>
            {media?.caption ? (
              <Text numberOfLines={1} style={{ color: "#CBD5E1", fontSize: 12, marginTop: 3 }}>
                {media.caption}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            style={{ alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, height: 42, justifyContent: "center", width: 42 }}
          >
            <Ionicons name="close-outline" size={26} color={COLORS.TEXT_WHITE} />
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          {media?.isVideo ? (
            <VideoView
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls
              style={{ aspectRatio: 16 / 9, backgroundColor: "#000000", width: "100%" }}
            />
          ) : media ? (
            <Image
              source={{ uri: media.url }}
              contentFit="contain"
              enableLiveTextInteraction
              allowDownscaling={false}
              style={{ height: "100%", transform: [{ scale: zoom }], width: "100%" }}
            />
          ) : null}
        </View>

        {!media?.isVideo ? (
          <View style={{ alignItems: "center", gap: 10, paddingBottom: 28, paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999, flexDirection: "row", overflow: "hidden" }}>
              <ZoomButton icon="remove-outline" onPress={zoomOut} />
              <Pressable onPress={resetZoom} style={{ alignItems: "center", justifyContent: "center", minWidth: 72, paddingHorizontal: 12 }}>
                <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 12, fontWeight: "900" }}>{Math.round(zoom * 100)}%</Text>
              </Pressable>
              <ZoomButton icon="add-outline" onPress={zoomIn} />
            </View>
            <Text style={{ color: "#CBD5E1", fontSize: 12, textAlign: "center" }}>Use the controls to zoom the image.</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function ZoomButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", height: 44, justifyContent: "center", width: 48 }}>
      <Ionicons name={icon} size={22} color={COLORS.TEXT_WHITE} />
    </Pressable>
  );
}
