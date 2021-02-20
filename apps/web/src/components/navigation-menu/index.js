import React from "react";
import ReactDOM from "react-dom";
import { Flex } from "rebass";
import { useStore as useAppStore } from "../../stores/app-store";
import * as Icon from "../icons";
import { useStore as useUserStore } from "../../stores/user-store";
import { useStore as useThemeStore } from "../../stores/theme-store";
import Animated from "../animated";
import NavigationItem from "./navigation-item";
import { hashNavigate, navigate } from "../../navigation";
import { toTitleCase } from "../../utils/string";
import { COLORS } from "../../common";
import { db } from "../../common/db";
import useMobile from "../../utils/use-mobile";
import useTablet from "../../utils/use-tablet";
import { useLocation } from "wouter";

function shouldSelectNavItem(route, pin) {
  if (pin.type === "notebook") {
    return route.startsWith(`/notebooks/${pin.id}`);
  } else if (pin.type === "topic") {
    return route.startsWith(`/notebooks/${pin.notebookId}/${pin.id}`);
  } else if (pin.type === "tag") {
    return route.startsWith(`/tags/${pin.id}`);
  }
}

const routes = [
  { title: "Notes", path: "/", icon: Icon.Note },
  {
    title: "Notebooks",
    path: "/notebooks",
    icon: Icon.Notebook,
  },
  {
    title: "Favorites",
    path: "/favorites",
    icon: Icon.StarOutline,
  },
  { title: "Tags", path: "/tags", icon: Icon.Tag },
  { title: "Trash", path: "/trash", icon: Icon.Trash },
];

const bottomRoutes = [
  {
    title: "Settings",
    path: "/settings",
    icon: Icon.Settings,
  },
];

function NavigationMenu(props) {
  const { toggleNavigationContainer } = props;
  const [location] = useLocation();
  const isFocusMode = useAppStore((store) => store.isFocusMode);
  const colors = useAppStore((store) => store.colors);
  const pins = useAppStore((store) => store.menuPins);
  const isSideMenuOpen = useAppStore((store) => store.isSideMenuOpen);
  const refreshMenuPins = useAppStore((store) => store.refreshMenuPins);
  const toggleSideMenu = useAppStore((store) => store.toggleSideMenu);
  const isSyncing = useUserStore((store) => store.isSyncing);
  const isLoggedIn = useUserStore((store) => store.isLoggedIn);
  //const logout = useUserStore((store) => store.logout);
  const sync = useUserStore((store) => store.sync);
  const theme = useThemeStore((store) => store.theme);
  const toggleNightMode = useThemeStore((store) => store.toggleNightMode);
  const isMobile = useMobile();
  const isTablet = useTablet();

  return (
    <Animated.Flex
      id="navigationmenu"
      flexDirection="column"
      justifyContent="space-between"
      initial={{
        opacity: 1,
        x: isMobile ? -500 : 0,
      }}
      animate={{
        opacity: isFocusMode ? 0 : 1,
        visibility: isFocusMode ? "collapse" : "visible",
        x: isMobile ? (isSideMenuOpen ? 0 : -500) : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      sx={{
        borderRight: "1px solid",
        borderRightColor: "border",
        minWidth: [
          "85%",
          isSideMenuOpen && !isFocusMode ? 150 : 0,
          isFocusMode ? 0 : 150,
        ],
        maxWidth: [
          "85%",
          isSideMenuOpen && !isFocusMode ? 150 : 0,
          isFocusMode ? 0 : 150,
        ],
        zIndex: !isSideMenuOpen ? -1 : isMobile ? 999 : isTablet ? 1 : 1,
        height: ["100%", "auto", "auto"],
        position: ["absolute", "relative", "relative"],
      }}
      bg={"bgSecondary"}
      px={0}
    >
      {isMobile &&
        isSideMenuOpen &&
        ReactDOM.createPortal(
          <Flex
            sx={{
              position: "absolute",
              height: "100%",
              width: "100%",
              zIndex: 998,
            }}
            bg="overlay"
            onClick={() => toggleSideMenu()}
          />,
          document.getElementById("app")
        )}
      <Flex
        flexDirection="column"
        sx={{
          overflow: "scroll",
          scrollbarWidth: "none",
          "::-webkit-scrollbar": { width: 0, height: 0 },
          msOverflowStyle: "none",
        }}
      >
        {routes.map((item) => (
          <NavigationItem
            key={item.path}
            title={item.title}
            icon={item.icon}
            selected={
              item.path === "/"
                ? location === item.path
                : location.startsWith(item.path)
            }
            onClick={() => {
              if (!isMobile && !isTablet && location === item.path)
                return toggleNavigationContainer();
              toggleNavigationContainer(true);
              navigate(item.path);
            }}
          />
        ))}
        {colors.map((color) => (
          <NavigationItem
            key={color.id}
            title={toTitleCase(color.title)}
            icon={Icon.Circle}
            selected={location === `/colors/${color.id}`}
            color={COLORS[color.title]}
            onClick={() => {
              navigate(`/colors/${color.id}`);
            }}
          />
        ))}
        <Flex
          flexDirection="column"
          sx={{ borderTop: "1px solid", borderTopColor: "border" }}
        >
          {pins.map((pin) => (
            <NavigationItem
              key={pin.id}
              title={pin.title}
              menu={{
                items: [
                  {
                    key: "removeshortcut",
                    title: () => "Remove shortcut",
                    onClick: async ({ pin }) => {
                      await db.settings.unpin(pin.id);
                      refreshMenuPins();
                    },
                  },
                ],
                extraData: { pin },
              }}
              icon={
                pin.type === "notebook"
                  ? Icon.Notebook2
                  : pin.type === "tag"
                  ? Icon.Tag2
                  : Icon.Topic
              }
              isShortcut
              selected={shouldSelectNavItem(location, pin)}
              onClick={() => {
                if (pin.type === "notebook") {
                  navigate(`/notebooks/${pin.id}`);
                } else if (pin.type === "topic") {
                  navigate(`/notebooks/${pin.notebookId}/${pin.id}`);
                } else if (pin.type === "tag") {
                  navigate(`/tags/${pin.id}`);
                }
              }}
            />
          ))}
        </Flex>
      </Flex>
      <Flex flexDirection="column">
        {theme === "light" ? (
          <NavigationItem
            title="Dark mode"
            icon={Icon.DarkMode}
            onClick={toggleNightMode}
          />
        ) : (
          <NavigationItem
            title="Light mode"
            icon={Icon.LightMode}
            onClick={toggleNightMode}
          />
        )}
        {isLoggedIn ? (
          <>
            <NavigationItem
              title="Sync"
              isLoading={isSyncing}
              icon={Icon.Sync}
              onClick={sync}
            />
          </>
        ) : (
          <NavigationItem
            title="Login"
            icon={Icon.Login}
            onClick={() => hashNavigate("/login")}
          />
        )}
        {bottomRoutes.map((item) => (
          <NavigationItem
            key={item.path}
            title={item.title}
            icon={item.icon}
            onClick={() => {
              navigate(item.path);
            }}
            selected={location.startsWith(item.path)}
          />
        ))}
      </Flex>
    </Animated.Flex>
  );
}
export default NavigationMenu;
