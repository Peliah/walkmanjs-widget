const VISITOR_KEY = 'walkmanjs_visitor_id';

export function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

