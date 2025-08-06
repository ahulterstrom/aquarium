import { getVisitorSystem } from "@/components/systems/visitorSystem";
import { useUIStore } from "@/stores/uiStore";
import { useRef, useEffect } from "react";
import { Visitor } from "@/types/game.types";
import {
  User,
  Heart,
  DollarSign,
  Clock,
  Eye,
  Activity,
  MapPin,
  Star,
  Info,
} from "lucide-react";

interface VisitorRefs {
  name: HTMLSpanElement | null;
  state: HTMLSpanElement | null;
  satisfaction: HTMLSpanElement | null;
  satisfactionBar: HTMLDivElement | null;
  money: HTMLDivElement | null;
  happiness: HTMLDivElement | null;
  visitTime: HTMLDivElement | null;
  interests: HTMLDivElement | null;
  thoughts: HTMLDivElement | null;
  tanksVisited: HTMLDivElement | null;
  currentPOI: HTMLSpanElement | null;
  walkingSpeed: HTMLDivElement | null;
}

const getStateColor = (state: string) => {
  switch (state) {
    case "entering":
      return "#10b981"; // green
    case "exploring":
      return "#eab308"; // yellow
    case "thinking":
      return "#8b5cf6"; // purple
    case "travelingToPoi":
      return "#06b6d4"; // cyan
    case "viewing":
      return "#3b82f6"; // blue
    case "satisfied":
      return "#f97316"; // orange
    case "leaving":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const VisitorInfo = () => {
  const selectedVisitorId = useUIStore.use.selectedVisitorId();
  const refs = useRef<VisitorRefs>({
    name: null,
    state: null,
    satisfaction: null,
    satisfactionBar: null,
    money: null,
    happiness: null,
    visitTime: null,
    interests: null,
    thoughts: null,
    tanksVisited: null,
    currentPOI: null,
    walkingSpeed: null,
  });

  const lastVisitorData = useRef<Visitor | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Update content imperatively using requestAnimationFrame
  const updateVisitorInfo = () => {
    if (!selectedVisitorId) {
      // No visitor selected, keep showing last visitor data if available
      // Continue the animation loop
      animationFrameId.current = requestAnimationFrame(updateVisitorInfo);
      return;
    }

    const visitorSystem = getVisitorSystem();
    const visitor = visitorSystem
      .getVisitors()
      .find((v) => v.id === selectedVisitorId);

    if (!visitor) {
      // Visitor no longer exists (they left), but keep showing their last data
      // Just update the state to show they've left
      if (refs.current.state) {
        refs.current.state.textContent = "left";
        refs.current.state.style.color = "#6b7280"; // gray
        refs.current.state.style.fontWeight = "bold";
      }
      // Continue the animation loop
      animationFrameId.current = requestAnimationFrame(updateVisitorInfo);
      return;
    }

    // Show all elements
    Object.values(refs.current).forEach((ref) => {
      if (ref && ref.parentElement) {
        ref.parentElement.style.display = "";
      }
    });

    // Update name
    if (refs.current.name) {
      refs.current.name.textContent = visitor.name;
    }

    // Update state with color
    if (refs.current.state) {
      refs.current.state.textContent = visitor.state;
      refs.current.state.style.color = getStateColor(visitor.state);
      refs.current.state.style.fontWeight = "bold";
    }

    // Update satisfaction bar
    if (refs.current.satisfaction && refs.current.satisfactionBar) {
      const percentage = (visitor.satisfaction / visitor.maxSatisfaction) * 100;
      refs.current.satisfaction.textContent = `${Math.round(visitor.satisfaction)}/${visitor.maxSatisfaction}`;
      refs.current.satisfactionBar.style.width = `${percentage}%`;

      // Color based on satisfaction level
      if (percentage < 30) {
        refs.current.satisfactionBar.style.backgroundColor = "#ef4444"; // red
      } else if (percentage < 70) {
        refs.current.satisfactionBar.style.backgroundColor = "#eab308"; // yellow
      } else {
        refs.current.satisfactionBar.style.backgroundColor = "#10b981"; // green
      }
    }

    // Update stats
    if (refs.current.money) {
      refs.current.money.textContent = `$${visitor.money.toFixed(0)}`;
    }

    if (refs.current.happiness) {
      refs.current.happiness.textContent = `${Math.round(visitor.happiness)}%`;
    }

    if (refs.current.visitTime) {
      refs.current.visitTime.textContent = formatTime(visitor.totalVisitTime);
    }

    if (refs.current.walkingSpeed) {
      refs.current.walkingSpeed.textContent = `${visitor.preferences.walkingSpeed.toFixed(2)}`;
    }

    // Update interests
    if (refs.current.interests) {
      const fishInterests = visitor.interests.fishTypes.join(", ") || "None";
      const sizeInterests = visitor.interests.tankSizes.join(", ") || "None";
      refs.current.interests.innerHTML = `
        <div style="margin-bottom: 4px"><strong>Fish:</strong> ${fishInterests}</div>
        <div><strong>Tank sizes:</strong> ${sizeInterests}</div>
      `;
    }

    // Update current POI
    if (refs.current.currentPOI) {
      if (visitor.targetPOIId) {
        const poi = visitorSystem.getPOI(visitor.targetPOIId);
        // POI doesn't have a name property, so we'll show the type and ID
        if (poi) {
          refs.current.currentPOI.textContent = `${poi.type} ${poi.id.slice(-4)}`;
        } else {
          refs.current.currentPOI.textContent = "Unknown";
        }
      } else {
        refs.current.currentPOI.textContent = "None";
      }
    }

    // Update tanks visited
    if (refs.current.tanksVisited) {
      if (visitor.tanksVisited.length > 0) {
        // Show tank IDs (shortened for display)
        const visitedTanksList = visitor.tanksVisited.map(tankId => 
          `Tank ${tankId.slice(-4)}`
        );
        
        refs.current.tanksVisited.innerHTML = visitedTanksList.join(', ');
      } else {
        refs.current.tanksVisited.textContent = "None yet";
      }
    }

    // Update thoughts (placeholder for future feature)
    if (refs.current.thoughts) {
      if (visitor.thoughts.length > 0) {
        refs.current.thoughts.textContent =
          visitor.thoughts[visitor.thoughts.length - 1];
      } else {
        // Generate contextual thought based on state
        let thought = "";
        switch (visitor.state) {
          case "entering":
            thought = "Excited to explore the aquarium!";
            break;
          case "exploring":
            thought = "Looking for interesting exhibits...";
            break;
          case "thinking":
            thought = "Hmm, where should I go next?";
            break;
          case "travelingToPoi":
            thought = "This looks interesting!";
            break;
          case "viewing":
            thought =
              visitor.satisfaction > 50
                ? "These fish are amazing!"
                : "Nice fish...";
            break;
          case "satisfied":
            thought = "What a great visit!";
            break;
          case "leaving":
            thought = "Time to head home...";
            break;
        }
        refs.current.thoughts.textContent = thought;
        refs.current.thoughts.style.fontStyle = "italic";
      }
    }

    lastVisitorData.current = visitor;

    // Continue the animation loop
    animationFrameId.current = requestAnimationFrame(updateVisitorInfo);
  };

  // Start/stop the animation loop based on component lifecycle and selection changes
  useEffect(() => {
    // Start the update loop whenever selection changes
    animationFrameId.current = requestAnimationFrame(updateVisitorInfo);

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVisitorId]); // Re-run when selection changes

  // Show placeholder if no visitor has ever been selected
  if (!selectedVisitorId && !lastVisitorData.current) {
    return (
      <div className="p-4 text-center text-gray-500">
        <User className="mx-auto mb-2 h-12 w-12 opacity-30" />
        <p>Select a visitor to view their information</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5" />
          <span ref={(el) => (refs.current.name = el)}>Loading...</span>
        </h3>
        <div className="mt-1 text-sm text-gray-600">
          Status: <span ref={(el) => (refs.current.state = el)}>...</span>
        </div>
      </div>

      {/* Satisfaction Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Satisfaction
          </span>
          <span ref={(el) => (refs.current.satisfaction = el)}>0/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            ref={(el) => (refs.current.satisfactionBar = el)}
            className="h-full transition-all duration-300"
            style={{ width: "0%", backgroundColor: "#10b981" }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div>
            <div className="text-gray-600">Money</div>
            <div
              className="font-medium"
              ref={(el) => (refs.current.money = el)}
            >
              $0
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-gray-600">Happiness</div>
            <div
              className="font-medium"
              ref={(el) => (refs.current.happiness = el)}
            >
              0%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-gray-600">Visit Time</div>
            <div
              className="font-medium"
              ref={(el) => (refs.current.visitTime = el)}
            >
              0:00
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-500" />
          <div>
            <div className="text-gray-600">Speed</div>
            <div
              className="font-medium"
              ref={(el) => (refs.current.walkingSpeed = el)}
            >
              0.00
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1 text-sm font-medium">
          <Eye className="h-4 w-4" />
          Interests
        </h4>
        <div
          className="text-sm text-gray-600"
          ref={(el) => (refs.current.interests = el)}
        >
          Loading interests...
        </div>
      </div>

      {/* Current Activity */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          Current Target
        </h4>
        <div className="text-sm text-gray-600">
          <span ref={(el) => (refs.current.currentPOI = el)}>None</span>
        </div>
      </div>

      {/* Visited Tanks */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1 text-sm font-medium">
          <Eye className="h-4 w-4" />
          Tanks Visited
        </h4>
        <div
          className="text-sm text-gray-600"
          ref={(el) => (refs.current.tanksVisited = el)}
        >
          None yet
        </div>
      </div>

      {/* Thoughts */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1 text-sm font-medium">
          <Info className="h-4 w-4" />
          Current Thought
        </h4>
        <div
          className="text-sm text-gray-600 italic"
          ref={(el) => (refs.current.thoughts = el)}
        >
          ...
        </div>
      </div>
    </div>
  );
};
