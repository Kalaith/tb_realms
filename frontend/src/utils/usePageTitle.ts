import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setPageTitle, getPageTitleFromPath } from './titleUtils';

/**
 * Custom hook that updates the page title based on the current route
 * Should be used in the top-level component of the application
 */
const usePageTitle = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Get the title based on the current path
    const pageTitle = getPageTitleFromPath(location.pathname);

    // Set the document title
    setPageTitle(pageTitle);
  }, [location.pathname]);
};

export default usePageTitle;
