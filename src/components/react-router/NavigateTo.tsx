/**
 * Component that renders the react-router Navigate component to
 * the input route.
 * @module components/react-router/NavigateTo
 *
 * @see {@link dashboard/Routes} for usage.
 * @see {@link https://reactrouter.com/web/api/Navigate} for documentation.
 */
import { Navigate } from 'react-router-dom'
import { Routes } from '@/router/constants'

/**
 * Component that renders the Navigate component to redirect to the input route.
 * @returns {React.JSX.Element}
 */
const NavigateTo: React.FC<{ route: Routes }> = ({
  route,
}): React.JSX.Element => <Navigate to={route} replace={true} />

export default NavigateTo
