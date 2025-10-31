import { useEffect, useState } from "react";
import { getMyMenu } from "../api/menu";

export function useMenu(enabled = false) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      setLoading(true);
      try        {
        const items = await getMyMenu();

        // Normalize property names (backend returns PascalCase)
        const normalized = items.map(item => ({
          actionId: item.actionId || item.ActionId,
          actionCode: item.actionCode || item.ActionCode,
          actionName: item.actionName || item.ActionName,
          path: item.path || item.Path,
          menuGroup: item.menuGroup || item.MenuGroup,
          parentId: item.parentId || item.ParentId,
          sortOrder: item.sortOrder || item.SortOrder,
          icon: item.icon || item.Icon,
          children: []
        }));

        // Build tree structure
        const map = {};
        const roots = [];
        
        normalized.forEach((it) => {
          map[it.actionId] = it;
        });
        
        normalized.forEach((it) => {
          if (it.parentId && map[it.parentId]) {
            map[it.parentId].children.push(map[it.actionId]);
          } else {
            roots.push(map[it.actionId]);
          }
        });
        
        roots.sort((a, b) => a.sortOrder - b.sortOrder);
        roots.forEach((r) => r.children.sort((a, b) => a.sortOrder - b.sortOrder));
        
        setMenu(roots);
      } catch (error) {
        console.error("Failed to load menu:", error);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled]);

  return { menu, loading };
}
