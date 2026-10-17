import { Link } from 'react-router'
import PostedByIcon from '../../assets/icons/postedby.svg'
import LocationIcon from '../../assets/icons/location.svg'

const UserInfoCard = ({ type, name = 'Pradip Kumar', location = 'Maharashtra', intro = 'Passionate innovator focused on sustainable agricultural solutions.', userId }) => {
  return (
    <div className="border border-input-border rounded-xl sm:rounded-2xl p-4 ">
      <div className="text-primary text-sm sm:text-base mb-2.5 sm:mb-3">{type}</div>

      <div className="flex items-center gap-2 mb-2">
        <img src={PostedByIcon} alt="User" className="w-4 h-4" />
        <span className="text-heading text-sm sm:text-base">{name}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <img src={LocationIcon} alt="Location" className="w-4 h-4" />
        <span className="text-heading text-sm sm:text-base">{location}</span>
      </div>

      {type=="Innovator" && <p className="text-muted text-sm sm:text-lg mb-3 sm:mb-4 line-clamp-3">{intro}</p>}
      
      <Link 
        to={userId ? `/profile/${userId}` : '#'}
        className="block w-full text-center py-2.5 sm:py-3 bg-button-dark border border-accent-green text-light rounded-xl text-sm sm:text-base hover:bg-accent-gold transition-all cursor-pointer"
      >
        View Profile
      </Link>
    </div>
  )
}

export default UserInfoCard