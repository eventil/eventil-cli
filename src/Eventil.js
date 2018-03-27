import fs from 'fs'
import { h, Component, Text } from 'ink'
import terminal from 'term-size'
import TextInput from 'ink-text-input'
import SelectInput from 'ink-select-input'
import Spinner from 'ink-spinner'
import axios from 'axios';
import { format, parse, distanceInWords } from 'date-fns';

const notEmpty = x => x.length !== 0
const isEmpty = x => x.length === 0

export const search = ({ q }) =>
  axios.get('https://api.eventil.com/search', {
    params: {
      q
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

const PROGRESS_NOT_LOADED = 0
const PROGRESS_LOADING = 1
const PROGRESS_LOADED = 2
const PROGRESS_ERROR = 3

const Event = ({ date, name, topics }) => (
  <span>
    <Text>{date} - </Text>
    <Text green bold>{`${name}\n`.padEnd(40)}</Text>
    <Text>{``.padStart(2)}</Text>
    <Text grey>{topics}</Text>
  </span>
)

const Search = ({ value, onChange, onSubmit }) => (
  <div>
    <Text bold white>{`Search for upcoming tech events about: `}</Text>
    <TextInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      placeholder="..."
    />
  </div>
)

const SelectedEvent = ({ name, date, url }) => (
  <div>
    <Text magenta>{` › `}</Text>
    <Text bold green>{`${name}\n`}</Text>
    <Text>{date} - {url}</Text>
  </div>
)

const SelectedEvents = ({ events }) => (
  <div>
    <Text bold white>Selected: </Text>
    <br/>
    {events.map(pkg => (
      <SelectedEvent key={pkg.name} {...pkg} />
    ))}
  </div>
)

const SearchResults = ({ events, onToggle, loading }) => (
  <span>
    <SelectInput
      items={events}
      itemComponent={Event}
      onSelect={onToggle}
    />
    {isEmpty(events) && (<NotFoundInfo />)}
    <EventilInfo />
    {loading === PROGRESS_LOADING && (
      <div>
        <Text bold><Spinner red /> Searching...</Text>
      </div>
    )}
  </span>
)

const SearchInfo = () => (
  <div>
    <Text grey>Start typing...</Text>
  </div>
)

const NotFoundInfo = () => (
  <div>
    <Text grey>
      {`There are no events matching your query...`}
    </Text>
  </div>
)

const ErrorInfo = () => (
  <div>
    <Text red>Check your internet connection.</Text>
  </div>
)

const EventilInfo = () => (
  <div>
    <Text grey>---</Text>
    <br/>
    <Text>Powered by </Text>
    <Text bgHex='#333a47' white bold>Eventil</Text>
    <Text> - </Text>
    <Text underline white bold>https://eventil.com</Text>
    <br/>
    <Text>Let's make it better at </Text>
    <Text underline white bold>https://github.com/eventil/eventil-cli</Text>
  </div>
)

class Eventil extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: '',
      found: [],
      selected: [],
      loading: PROGRESS_NOT_LOADED
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
  }

  render() {
    const { query, found, selected, loading } = this.state

    return (
      <div>
        <Search
          value={query}
          onChange={this.handleQueryChange}
          onSubmit={() => { }}
          loading={loading}
        />
        {loading === PROGRESS_NOT_LOADED && <SearchInfo />}
        {loading === PROGRESS_ERROR && <ErrorInfo />}
        {notEmpty(query) && (
          <SearchResults
            events={found}
            onToggle={this.handleToggle}
            loading={loading}
          />
        )}
        {notEmpty(selected) && <SelectedEvents events={selected} />}
      </div>
    )
  }

  async handleQueryChange(query) {
    this.setState({ query, loading: PROGRESS_LOADING })

    try {
      const res = await this.fetch(query)

      if (this.state.query === query) {
        this.setState({
          found: res,
          loading: PROGRESS_LOADED
        })
      }
    } catch (err) {
      this.setState({
        loading: PROGRESS_ERROR
      })
    }
  }

  async fetch(query) {
    const { data } = await search({ q: query })

    const events = data.map(({ name, topics, startedAt, slug }) => ({
      name,
      topics,
      date: format(parse(startedAt), 'MMM DD, YYYY'),
      url: `https://eventil.com/events/${slug}`
    }))

    return events;
  }

  handleToggle(item) {
    const { selected, loading } = this.state

    if (loading !== PROGRESS_LOADED) {
      return
    }

    const exists = selected.some(
      ({ objectID }) => objectID === item.objectID
    )

    if (exists) {
      this.setState({
        query: '',
        selected: selected.filter(({ objectID }) => objectID !== item.objectID)
      })
    } else {
      this.setState({
        query: '',
        selected: [...selected, item]
      })
    }
  }
}

export default Eventil
