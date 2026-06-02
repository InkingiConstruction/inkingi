import { Button } from "react-native";

interface Props {
  status: string;
  onAccept?: () => void;
  onOpen?: () => void;
  onApply?: () => void;
}

export default function ProjectActions({
  status,
  onAccept,
  onOpen,
  onApply,
}: Props) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Button
          title="Apply"
          onPress={onApply}
        />
      );

    case "INVITED":
      return (
        <Button
          title="Accept Invitation"
          onPress={onAccept}
        />
      );

    case "ACTIVE":
      return (
        <Button
          title="Open Project"
          onPress={onOpen}
        />
      );

    case "COMPLETED":
      return (
        <Button
          title="View Summary"
          onPress={onOpen}
        />
      );

    default:
      return null;
  }
}