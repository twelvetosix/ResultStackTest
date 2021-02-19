import React from 'react'
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/esm/ListGroupItem';
import axios from 'axios'


class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: '',
            users: [], 
            userData: [],
            loading: false,
            message: '',
            typing: false,
            searchTimeout: 0,
            totalResults: 0,
			totalPages: 0,
            currentPageNo: 0,
        };
        this.cancel = '';
    }

    fetchSearchResults = ( updatedPageNo = '', query ) => {
		const pageNumber = updatedPageNo ? '&page_num=${updatedPageNo}' : '';

		const searchUrl = 'https://api.github.com/search/users?q=' + query + '&per_page=5' + pageNumber;
        var userInfo;

		if( this.cancel ) {
			this.cancel.cancel();
		}

		this.cancel = axios.CancelToken.source();


		axios.get( searchUrl, {
			cancelToken: this.cancel.token
		})
			.then( res => {
				const total = res.data.total_count;
				const totalPagesCount = this.getPageCount( total, 10 );
				const resultNotFoundMsg = ! res.data.items.length
										? 'There are no more search results. Please try a new search'
										: '';                
				this.setState( {
					users: res.data.items,
					message: resultNotFoundMsg,
					totalResults: total,
					totalPages: totalPagesCount,
					currentPageNo: updatedPageNo,
					loading: false
				})
			})
            .then ( res => {
                console.log("GET USER INFO");
                this.state.users.map(user => {
                userInfo = axios.get(user.url, {
                    cancelToken: this.cancel.token
                })
                user["additionalInfo"] = userInfo;
                console.log(user);
            })})             
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	};

	handleInput = ( event ) => {
		const query = event.target.value;
        if(this.timeout) {
            clearTimeout(this.timeout);
        }
        if(query.length > 0)
        {
            this.timeout = setTimeout(() => {            
                this.setState( { query, loading: true, message: '' }, () => {
                    this.fetchSearchResults(1, query );
                });
            }, 500);
        }
		
	};

    getPageCount = ( total, denominator ) => {
		const divisible	= 0 === total % denominator;
		const valueToBeAdded = divisible ? 0 : 1;
		return Math.floor( total/denominator ) + valueToBeAdded;
	};

    renderUserList(props) {
        if (this.state.users.length > 0){
            return (            
                <ListGroup>
                        { this.state.users.map(user => this.renderUserItem(user))}
                </ListGroup>
            )
        } else {
            return;
        }
        
    }

    renderUserItem(user){
        return(
            <ListGroupItem className = "d-flex">
            <div className="row">
            <div className="col-sm">            
            <img src={user.avatar_url}/>
            </div>
            <div className="col-sm">  
            <h2>{user.login}</h2>

            </div>
            </div>                
            </ListGroupItem>
        )
    }


    // search = async (val) => {
    //     const resp = await newSearch('https://api.github.com/search/users?q=' + val);
    //     const users = await resp ? resp.data:'';
    //     console.log(resp)
    // }

    // handleInput(event) { 

    //     const q = event.target.value;
    //     if (this.state.typingTimeout) {
    //         clearTimeout(this.state.typingTimeout);
    //     }
    //     this.setState({typing: false, typingTimeout: setTimeout(function(){
    //         performSearch(q);
    //     }, 500)});


    // }

    performSearch(query) {    
        axios.get(`https://api.github.com/search/users?q=` + query, {headers: 
        {
            accept: 'application/vnd.github.v3+json'
        }})
            //{CancelToken: source.CancelToken})
             .then(res => {            
                 const users = res.data.items;
                 this.setState({ users });
             }).
             catch(function(e) {
                 if(axios.isCancel(e)) {
                     console.log('Request canceled', e.message);                    
                 } else {
                     console.log('Other error ' + e.message)
                 }
             })
    }
    
    render() {
        return (
            <Container className="p-3">
                {this.state.q}
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="searchLabel">Search:</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl id="query" placeholder="Name or Email" onChange={this.handleInput.bind(this)} />    
                </InputGroup>                
                {this.renderUserList()} 
 
    
                <Pagination>
                <Pagination.First />
                <Pagination.Prev />
                <Pagination.Item>{1}</Pagination.Item>
                <Pagination.Ellipsis />

                <Pagination.Item>{10}</Pagination.Item>
                <Pagination.Item>{11}</Pagination.Item>
                <Pagination.Item active>{12}</Pagination.Item>
                <Pagination.Item>{13}</Pagination.Item>
                <Pagination.Item disabled>{14}</Pagination.Item>

                <Pagination.Ellipsis />
                <Pagination.Item>{20}</Pagination.Item>
                <Pagination.Next />
                <Pagination.Last />
                </Pagination>
            </Container>
        );
    }
};

export default Search;
